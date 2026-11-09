Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\stackvil\gharsansar_backend-main\gharsansar_backend-main"
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""D:\stackvil\gharsansar_backend-main\gharsansar_backend-main\guardian.ps1""", 0, False
