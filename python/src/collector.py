import subprocess

# ---------------------------
# 공통 PowerShell 실행기
# ---------------------------
def _ps(cmd: str) -> str:
    try:
        p = subprocess.run(
            [
                r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe",
                "-NoProfile",
                "-Command",
                cmd
            ],
            capture_output=True,
            text=True,
            timeout=10
        )
        out = p.stdout.strip()
        return out if out else "N/A"
    except Exception:
        return "N/A"

# ---------------------------
# 단위 변환
# ---------------------------
def bytes_to_gb(b):
    try:
        return f"{int(float(b)) / (1024**3):.1f} GB"
    except:
        return "N/A"

def bytes_to_human(b):
    try:
        b = int(float(b))
        gb = b / (1024**3)
        if gb >= 1024:
            return f"{gb / 1024:.2f} TB"
        else:
            return f"{gb:.1f} GB"
    except:
        return "N/A"

# ---------------------------
# 저장장치 인터페이스 추정
# ---------------------------
def detect_disk_interface(model: str, pnp: str):
    m = (model or "").upper()
    p = (pnp or "").upper()
    if "NVME" in m or "NVME" in p:
        return "NVMe"
    elif "USB" in p:
        return "USB"
    else:
        return "SATA / HDD"

# ---------------------------
# 메인 수집 함수
# ---------------------------
def collect_hardware():
    data = []

    # ================= CPU =================
    cpu_name = _ps("(Get-CimInstance Win32_Processor).Name")
    cpu_id   = _ps("(Get-CimInstance Win32_Processor).ProcessorId")

    data.append(f"CPU: {cpu_name}")
    data.append(f"시리얼넘버: {cpu_id}")
    data.append("")

    # ================= 메인보드 =================
    mb_maker = _ps("(Get-CimInstance Win32_BaseBoard).Manufacturer")
    mb_prod  = _ps("(Get-CimInstance Win32_BaseBoard).Product")
    mb_sn    = _ps("(Get-CimInstance Win32_BaseBoard).SerialNumber")

    data.append(f"제조사: {mb_maker}")
    data.append(f"상품명: {mb_prod}")
    data.append(f"시리얼넘버: {mb_sn}")
    data.append("")

    # ================= BIOS =================
    bios_sn  = _ps("(Get-CimInstance Win32_BIOS).SerialNumber")
    bios_ver = _ps("(Get-CimInstance Win32_BIOS).SMBIOSBIOSVersion")

    data.append("바이오스")
    data.append(f"시리얼넘버: {bios_sn}")
    data.append(f"바이오스 버전: {bios_ver}")
    data.append("")

    # ================= RAM =================
    ram_blocks = _ps(
        "Get-CimInstance Win32_PhysicalMemory | "
        "Select Manufacturer,DeviceLocator,Capacity,SerialNumber | "
        "ConvertTo-Csv -NoTypeInformation"
    ).splitlines()[1:]

    for row in ram_blocks:
        try:
            m, slot, cap, sn = [x.strip('"') for x in row.split(",")]
        except:
            continue

        data.append("램")
        data.append(f"제조사: {m}")
        data.append(f"슬롯Number: {slot}")
        data.append(f"용량: {bytes_to_gb(cap)}")
        data.append(f"시리얼넘버: {sn}")
        data.append("")

    # ================= 저장장치 =================
    disks = _ps(
        "Get-CimInstance Win32_DiskDrive | "
        "Select Model,Size,SerialNumber,PNPDeviceID | "
        "ConvertTo-Csv -NoTypeInformation"
    ).splitlines()[1:]

    for row in disks:
        try:
            model, size, sn, pnp = [x.strip('"') for x in row.split(",")]
        except:
            continue

        iface = detect_disk_interface(model, pnp)

        data.append("저장장치")
        data.append(f"모델명: {model}")
        data.append(f"용량: {bytes_to_human(size)}")
        data.append(f"시리얼넘버: {sn}")
        data.append(f"타입: {iface}")
        data.append("")

    # ================= GPU =================
    gpus = _ps(
        "Get-CimInstance Win32_VideoController | "
        "Select Name,AdapterRAM,DriverVersion,PNPDeviceID,VideoBIOSVersion | "
        "ConvertTo-Csv -NoTypeInformation"
    ).splitlines()[1:]

    for row in gpus:
        try:
            name, vram, drv, pnp, bios = [x.strip('"') for x in row.split(",")]
        except:
            continue

        data.append("그래픽카드")
        data.append(f"모델명: {name}")
        data.append(f"Vram 용량: {bytes_to_gb(vram)}")
        data.append(f"드라이버 버전: {drv}")
        data.append(f"BIOS 버전: {bios if bios else 'N/A'}")
        data.append(f"PCI 식별번호: {pnp}")
        data.append("")

    return data
