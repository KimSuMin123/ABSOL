import os
import shutil
import subprocess
import time
from dataclasses import dataclass
from datetime import datetime

# ===========================
# 결과 리포트
# ===========================
@dataclass
class MigrationResult:
    copied_files: int
    failed_files: int
    total_files: int
    total_bytes: int
    report_path: str


# ===========================
# 내부 유틸
# ===========================
def _ensure_dir(p: str):
    os.makedirs(p, exist_ok=True)


def _iter_files(root: str):
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            yield os.path.join(dirpath, name)


def _get_total_bytes_and_files(src_root: str):
    total_bytes = 0
    files = []
    for f in _iter_files(src_root):
        try:
            sz = os.path.getsize(f)
        except OSError:
            sz = 0
        total_bytes += sz
        files.append((f, sz))
    return total_bytes, files


# ===========================
# PowerShell 포맷 (안정 버전)
# ===========================
def format_volume_ps(drive_root: str, quick: bool = True, label: str = "AbSoL"):
    letter = drive_root[0].upper()
    if letter == "C":
        raise RuntimeError("C: 드라이브는 포맷할 수 없습니다.")

    full_flag = "" if quick else "-Full"

    ps_cmd = (
        f"Format-Volume -DriveLetter {letter} "
        f"-FileSystem NTFS "
        f"-NewFileSystemLabel '{label}' "
        f"-Force -Confirm:$false {full_flag}"
    )

    cmd = [
        "cmd", "/c",
        r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command", ps_cmd
    ]


    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"포맷 실패:\n{p.stdout}\n{p.stderr}")


# ===========================
# 파일 복사 (진행률/ETA)
# ===========================
def _copy_file_chunked(src: str, dst: str, buf_size: int = 8 * 1024 * 1024):
    _ensure_dir(os.path.dirname(dst))
    with open(src, "rb") as rf, open(dst, "wb") as wf:
        while True:
            chunk = rf.read(buf_size)
            if not chunk:
                break
            wf.write(chunk)
    shutil.copystat(src, dst, follow_symlinks=True)


def mirror_copy_with_progress(src_root: str, dst_root: str, on_progress=None, report_fp=None):
    total_bytes, files = _get_total_bytes_and_files(src_root)
    total_files = len(files)

    done_bytes = 0
    done_files = 0
    copied_files = 0
    failed_files = 0

    start = time.time()

    for src_file, sz in files:
        rel = os.path.relpath(src_file, src_root)
        dst_file = os.path.join(dst_root, rel)

        try:
            _copy_file_chunked(src_file, dst_file)
            copied_files += 1
        except Exception as e:
            failed_files += 1
            if report_fp:
                report_fp.write(f"[COPY_FAIL] {rel} :: {e}\n")

        done_files += 1
        done_bytes += sz

        if on_progress:
            elapsed = max(0.001, time.time() - start)
            speed = done_bytes / elapsed
            remain = max(0, total_bytes - done_bytes)
            eta_sec = int(remain / speed) if speed > 0 else 0

            # ⭐ UI와 정확히 맞는 시그니처
            on_progress(
                done_bytes,
                total_bytes,
                rel,
                eta_sec
            )

    return copied_files, failed_files, total_files, total_bytes


# ===========================
# 메인 엔트리
# ===========================
def migrate_drive_clean(
    src_drive: str,
    dst_drive: str,
    on_progress=None,
    do_format: bool = True,
    quick_format: bool = True,
    label: str = "AbSoL"
) -> MigrationResult:

    src = os.path.abspath(src_drive)
    dst = os.path.abspath(dst_drive)

    if src[0].upper() == dst[0].upper():
        raise ValueError("원본과 대상 드라이브가 같습니다.")
    if src[0].upper() == "C" or dst[0].upper() == "C":
        raise RuntimeError("C: 드라이브는 사용할 수 없습니다.")

    if not os.path.exists(src):
        raise RuntimeError(f"원본 드라이브 없음: {src}")
    if not os.path.exists(dst):
        raise RuntimeError(f"대상 드라이브 없음: {dst}")

    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    _ensure_dir(desktop)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(desktop, f"AbSoL_Migration_Report_{ts}.txt")

    with open(report_path, "w", encoding="utf-8") as rep:
        rep.write("AbSoL Migration Report\n")
        rep.write(f"Started: {datetime.now()}\n")
        rep.write(f"Source: {src}\n")
        rep.write(f"Target: {dst}\n")
        rep.write(f"Format: {do_format} / Quick: {quick_format}\n\n")
        rep.write("[FAILED FILES]\n")

        # 1) 포맷
        if do_format:
            if on_progress:
                on_progress(0, 1, f"{dst[0]}: 포맷 중...", 0)
            format_volume_ps(dst, quick=quick_format, label=label)

        # 2) 복사
        copied, failed, total_files, total_bytes = mirror_copy_with_progress(
            src, dst, on_progress=on_progress, report_fp=rep
        )

        rep.write("\n[SUMMARY]\n")
        rep.write(f"Copied files: {copied}\n")
        rep.write(f"Failed files: {failed}\n")
        rep.write(f"Total files: {total_files}\n")
        rep.write(f"Total bytes: {total_bytes}\n")
        rep.write(f"Finished: {datetime.now()}\n")

    return MigrationResult(
        copied_files=copied,
        failed_files=failed,
        total_files=total_files,
        total_bytes=total_bytes,
        report_path=report_path
    )
