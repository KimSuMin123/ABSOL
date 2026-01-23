import os
from datetime import datetime
from elevate import is_admin, relaunch_as_admin
from collector import collect_hardware

from elevate import is_admin, relaunch_as_admin
from ui import AbSoLApp

def main():
    if not is_admin():
        relaunch_as_admin()
        return

    app = AbSoLApp()
    app.mainloop()

if __name__ == "__main__":
    main()
