import os
import re
import subprocess
from dataclasses import dataclass
from datetime import datetime

@dataclass
class PreDiagResult:
    drive: str                 # 예: "C:"
    disk_model: str
    disk_interface: str         # "NVMe" / "SATA" / "USB" / "Unknown"
    disk_type_guess: str        # "SSD/NVMe" / "HDD" / "Unknown"
    trim_enabled: str           # "Enabled" / "Disabled" / "Unknown"
    deletion_traces: list       # 텍스트 리스트
    recovery_score: int         # 0~100
    notes: list                 # 주의/설명

def run(cmd: str) -> str:
    try:
        p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        out = (p.stdout or "") + (p.stderr or "")
        return out.strip()
    except Exception as e:
        return str(e)

def get_trim_status() -> str:
    # 시스템 전역 수준(대부분)으로 판단
    out = run("fsutil behavior query DisableDeleteNotify")
    # DisableDeleteNotify = 0  -> TRIM 사용(Enable)
    # DisableDeleteNotify = 1  -> TRIM 비활성
    m = re.search(r"DisableDeleteNotify\s*=\s*(\d+)", out)
    if not m:
        return "Unknown"
    return "Enabled" if m.group(1) == "0" else "Disabled"

def list_physical_disks_wmic():
    # 모델/인터페이스/미디어타입 등
    out = run('wmic diskdrive get Model,InterfaceType,MediaType /format:list')
    blocks = [b.strip() for b in out.split("\n\n") if b.strip()]
    disks = []
    for b in blocks:
        model = ""
        iface = ""
        media = ""
        for line in b.splitlines():
            if line.startswith("Model="):
                model = line.split("=", 1)[1].strip()
            elif line.startswith("InterfaceType="):
                iface = line.split("=", 1)[1].strip()
            elif line.startswith("MediaType="):
                media = line.split("=", 1)[1].strip()
        if model or iface or media:
            disks.append({"model": model, "iface": iface, "media": media})
    return disks

def guess_interface_from_model_and_iface(model: str, iface: str) -> str:
    m = (model or "").upper()
    i = (iface or "").upper()
    if "NVME" in m:
        return "NVMe"
    if i == "USB":
        return "USB"
    if i in ("IDE", "SATA"):
        return "SATA"
    if i == "SCSI":
        # Windows에서 NVMe/SATA가 SCSI로 뭉뚱그려 나오는 경우 많음
        # 모델명에 NVMe가 있으면 NVMe로
        return "NVMe" if "NVME" in m else "SATA"
    return iface or "Unknown"

def guess_disk_type(media_type: str, interface: str, model: str) -> str:
    mt = (media_type or "").upper()
    m = (model or "").upper()
    it = (interface or "").upper()

    # wmic media type이 비어있을 때가 많아서 보수적으로 추정
    if "SSD" in mt or "SOLID" in mt:
        return "SSD/NVMe"
    if "HDD" in mt or "FIXED" in mt and ("SSD" not in m and "NVME" not in m):
        # FIXED는 애매하지만 모델명에 SSD/NVMe 단서 없으면 HDD로 기울임
        return "HDD"
    if "NVME" in m:
        return "SSD/NVMe"
    # 모델명에 SSD/PM/PRO/EVO 등이 있으면 SSD로 추정
    if any(k in m for k in ["SSD", "EVO", "PRO", "PM9", "SN7", "MP5", "MX5", "P3", "P5"]):
        return "SSD/NVMe"
    # 인터페이스가 USB면 외장(SSD/HDD 둘 다 가능)
    if it == "USB":
        return "Unknown"
    return "Unknown"

def deletion_trace_checks(drive_letter: str):
    # "삭제 흔적"을 “복구 전 사전 위험 신호” 수준으로만 탐지
    # - 휴지통 존재/크기
    # - USN Journal 존재(있으면 최근 파일 이벤트 기록 가능성)
    traces = []
    dl = drive_letter.rstrip("\\")
    # Recycle Bin
    recycle = os.path.join(dl + "\\", "$Recycle.Bin")
    if os.path.isdir(recycle):
        traces.append("휴지통 폴더 존재($Recycle.Bin)")
        # 대략적 크기 스캔(너무 오래 걸리지 않게 파일 수 제한)
        count = 0
        try:
            for root, _, files in os.walk(recycle):
                count += len(files)
                if count > 2000:
                    break
            traces.append(f"휴지통 파일 흔적(대략 파일 수): {count}+")
        except Exception:
            pass
    else:
        traces.append("휴지통 폴더 없음/접근 불가")

    # USN Journal
    out = run(f'fsutil usn queryjournal {dl}')
    if "USN Journal ID" in out:
        traces.append("USN 저널 활성(파일 변경/삭제 이벤트 흔적 존재 가능)")
    else:
        traces.append("USN 저널 비활성/조회 불가")

    return traces

def score_recovery(disk_type_guess: str, trim_status: str, interface: str):
    # 아주 현실적인 휴리스틱(설명용)
    # HDD: 높음
    # SSD/NVMe + TRIM Enabled: 낮음(삭제 후 빠르게 무효화)
    # SSD/NVMe + TRIM Disabled: 중간
    notes = []
    score = 50

    if disk_type_guess == "HDD":
        score = 80
        notes.append("HDD는 TRIM이 없어서 삭제 데이터 잔존 확률이 상대적으로 높습니다.")
    elif disk_type_guess == "SSD/NVMe":
        if trim_status == "Enabled":
            score = 25
            notes.append("SSD/NVMe + TRIM 활성: 삭제 데이터가 빠르게 무효화될 수 있어 복구 난이도가 높습니다.")
        elif trim_status == "Disabled":
            score = 55
            notes.append("SSD/NVMe + TRIM 비활성: 상황에 따라 복구 가능성이 일부 상승할 수 있습니다.")
        else:
            score = 40
            notes.append("SSD/NVMe: TRIM 상태를 확인해야 복구 가능성 판단이 정확해집니다.")
    else:
        score = 45
        notes.append("디스크 타입이 불명확하여 보수적으로 점수화했습니다.")

    if interface == "USB":
        notes.append("USB 외장 케이스/어댑터 사용 시 정보(모델/타입)가 부정확할 수 있습니다.")

    # 0~100 클램프
    score = max(0, min(100, score))
    return score, notes

def pre_diagnose(drive_letter: str) -> PreDiagResult:
    drive = drive_letter.strip().upper()
    if len(drive) == 1:
        drive += ":"
    if not drive.endswith(":"):
        drive += ":"

    # 모델/인터페이스/미디어타입은 물리디스크 기준(간단화: 첫 디스크를 대표값처럼 보여줌)
    # 실무 확장 시: 논리드라이브->파티션->디스크 매핑이 필요함(추후 구현 가능)
    disks = list_physical_disks_wmic()
    disk_model = disks[0]["model"] if disks else "Unknown"
    raw_iface = disks[0]["iface"] if disks else "Unknown"
    media = disks[0]["media"] if disks else "Unknown"

    disk_interface = guess_interface_from_model_and_iface(disk_model, raw_iface)
    disk_type = guess_disk_type(media, disk_interface, disk_model)

    trim = get_trim_status()
    traces = deletion_trace_checks(drive)
    score, notes = score_recovery(disk_type, trim, disk_interface)

    return PreDiagResult(
        drive=drive,
        disk_model=disk_model or "Unknown",
        disk_interface=disk_interface or "Unknown",
        disk_type_guess=disk_type,
        trim_enabled=trim,
        deletion_traces=traces,
        recovery_score=score,
        notes=notes,
    )
