import tkinter as tk
from tkinter import messagebox, simpledialog
import threading
import queue
import os
import string
import time

from elevate import is_admin, relaunch_as_admin
from migrate import migrate_drive_clean
from collector import collect_hardware
from diagnose import pre_diagnose


# ------------------ 공용 유틸 ------------------
def list_drives():
    return [f"{c}:\\" for c in string.ascii_uppercase if os.path.exists(f"{c}:\\")]

def hms(sec):
    sec = max(0, int(sec))
    return f"{sec//3600:02d}:{(sec%3600)//60:02d}:{sec%60:02d}"


# ================== APP ==================
class AbSoLApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AbSoL.tech A/S")
        self.geometry("900x600")
        self.resizable(False, False)

        self.ui_queue = queue.Queue()
        self.current_frame = None
        self._mig_start_time = None

        self.after(50, self._poll_ui)
        self.show_main_menu()

    # ---------- UI Queue ----------
    def _poll_ui(self):
        try:
            while True:
                fn = self.ui_queue.get_nowait()
                fn()
        except queue.Empty:
            pass
        self.after(50, self._poll_ui)

    def clear(self):
        if self.current_frame:
            self.current_frame.destroy()
            self.current_frame = None

    # ---------- 로고 ----------
    def add_logo(self, parent):
        top = tk.Frame(parent)
        top.pack(pady=20)

        logo = tk.Frame(top)
        logo.pack()

        tk.Label(logo, text="Ab", font=("Segoe UI", 32, "bold"), fg="#1e90ff").pack(side="left")
        tk.Label(logo, text="SoL", font=("Segoe UI", 32, "bold"), fg="#e74c3c").pack(side="left")
        tk.Label(top, text="통합프로그램", font=("Segoe UI", 18, "bold")).pack()

    # ================= 메인 =================
    def show_main_menu(self):
        self.clear()
        f = tk.Frame(self)
        f.pack(fill="both", expand=True)
        self.current_frame = f

        self.add_logo(f)

        box = tk.Frame(f)
        box.pack(expand=True)

        tk.Button(box, text="하드웨어 정보 수집", width=35, height=2,
                  command=self.ui_collect_hw).pack(pady=8)
        tk.Button(box, text="데이터 마이그레이션", width=35, height=2,
                  command=self.ui_migrate).pack(pady=8)
        tk.Button(box, text="데이터 복구 사전진단", width=35, height=2,
                  command=self.ui_diagnose).pack(pady=8)
        tk.Button(box, text="종료", width=35, height=2,
                  command=self.quit).pack(pady=8)

    # ================= 하드웨어 =================
    def ui_collect_hw(self):
        self.clear()
        f = tk.Frame(self)
        f.pack(fill="both", expand=True)
        self.current_frame = f

        self.add_logo(f)
        tk.Label(f, text="하드웨어 정보 수집 중...", font=("Segoe UI", 14)).pack(pady=40)

        def worker():
            try:
                data = collect_hardware()
                path = os.path.join(os.path.expanduser("~"), "Desktop", "AbSoL_Hardware_Info.txt")
                with open(path, "w", encoding="utf-8") as fp:
                    fp.write("\n".join(data))
                self.ui_queue.put(lambda: messagebox.showinfo("완료", "바탕화면에 파일이 생성되었습니다."))
            except Exception as e:
                self.ui_queue.put(lambda err=str(e): messagebox.showerror("오류", err))
            self.ui_queue.put(self.show_main_menu)

        threading.Thread(target=worker, daemon=True).start()

    # ================= 마이그레이션 =================
    def ui_migrate(self):
        self.clear()
        f = tk.Frame(self)
        f.pack(fill="both", expand=True)
        self.current_frame = f

        self.add_logo(f)
        tk.Label(f, text="저장장치 마이그레이션", font=("Segoe UI", 14, "bold")).pack()

        drives = list_drives()
        if len(drives) < 2:
            messagebox.showerror("오류", "저장장치가 2개 이상 필요합니다.")
            self.show_main_menu()
            return

        src = tk.StringVar(value=drives[0])
        dst = tk.StringVar(value=drives[1])

        tk.Label(f, text="원본 저장장치").pack()
        tk.OptionMenu(f, src, *drives).pack()
        tk.Label(f, text="대상 저장장치").pack(pady=(10, 0))
        tk.OptionMenu(f, dst, *drives).pack()

        pct = tk.StringVar(value="0.000%")
        eta = tk.StringVar(value="남은 시간: 00:00:00")
        status = tk.StringVar(value="대기중")

        canvas = tk.Canvas(f, width=700, height=22, bg="#ddd")
        canvas.pack(pady=10)
        bar = canvas.create_rectangle(0, 0, 0, 22, fill="#2ecc71")

        tk.Label(f, textvariable=pct, font=("Consolas", 14, "bold")).pack()
        tk.Label(f, textvariable=eta).pack()
        tk.Label(f, textvariable=status).pack()

        def set_bar(p):
            canvas.coords(bar, 0, 0, int(7 * p), 22)

        def start():
            if not is_admin():
                messagebox.showinfo("권한", "관리자 권한이 필요합니다. 다시 실행합니다.")
                relaunch_as_admin()
                return

            if not messagebox.askyesno("경고", "대상 드라이브는 포맷됩니다. 계속 진행합니까?"):
                return

            letter = dst.get()[0].upper()
            typed = simpledialog.askstring("최종 확인", f"{letter} 를 입력하세요")
            if typed != letter:
                messagebox.showwarning("취소", "입력 불일치")
                return

            self._mig_start_time = time.time()

            def on_progress(*args):
                try:
                    done_b = args[0]
                    total_b = args[1]
                    cur = args[2] if len(args) > 2 else ""
                    eta_s = args[3] if len(args) > 3 else 0
                except Exception:
                    return

                p = 0 if total_b == 0 else (done_b / total_b) * 100

                self.ui_queue.put(
                    lambda p=p, e=eta_s, c=cur: (
                        pct.set(f"{p:0.3f}%"),
                        set_bar(p),
                        eta.set("남은 시간: " + hms(e)),
                        status.set(c)
        )
    )

            def worker():
                try:
                    migrate_drive_clean(
                        src.get(),
                        dst.get(),
                        on_progress=on_progress,
                        do_format=True,
                        quick_format=True
                    )
                    self.ui_queue.put(lambda: messagebox.showinfo("완료", "마이그레이션 완료"))
                except Exception as e:
                    self.ui_queue.put(lambda err=str(e): messagebox.showerror("오류", err))
                self.ui_queue.put(self.show_main_menu)

            threading.Thread(target=worker, daemon=True).start()

        tk.Button(f, text="마이그레이션 시작", width=25, height=2,
                  command=start).pack(pady=10)
        tk.Button(f, text="뒤로가기",
                  command=self.show_main_menu).pack()

    # ================= 진단 =================
    def ui_diagnose(self):
        self.clear()
        f = tk.Frame(self)
        f.pack(fill="both", expand=True)
        self.current_frame = f

        self.add_logo(f)
        tk.Label(f, text="데이터 복구 사전진단", font=("Segoe UI", 14, "bold")).pack(pady=10)

        drives = list_drives()
        d = tk.StringVar(value=drives[0])

        tk.OptionMenu(f, d, *drives).pack()

        out = tk.Text(f, width=100, height=18)
        out.pack(pady=10)
        out.insert("end", "대기중...\n")
        out.config(state="disabled")

        def run():
            try:
                r = pre_diagnose(d.get())
                lines = [
                    f"드라이브: {r.drive}",
                    f"모델: {r.disk_model}",
                    f"인터페이스: {r.disk_interface}",
                    f"타입: {r.disk_type_guess}",
                    f"TRIM: {r.trim_enabled}",
                    "",
                    "삭제/변경 흔적:"
                ]
                for t in r.deletion_traces:
                    lines.append(f"- {t}")
                lines.append("")
                lines.append(f"복구 가능성 점수: {r.recovery_score}/100")

                text = "\n".join(lines)

                self.ui_queue.put(lambda: (
                    out.config(state="normal"),
                    out.delete("1.0", "end"),
                    out.insert("end", text),
                    out.config(state="disabled")
                ))
            except Exception as e:
                self.ui_queue.put(lambda err=str(e): messagebox.showerror("오류", err))

        tk.Button(
            f, text="사전진단 실행", width=22, height=2,
            command=lambda: threading.Thread(target=run, daemon=True).start()
        ).pack(pady=10)

        tk.Button(
            f, text="뒤로가기", width=16, height=2,
            command=self.show_main_menu
        ).pack()


# ================= ENTRY =================
if __name__ == "__main__":
    app = AbSoLApp()
    app.mainloop()
