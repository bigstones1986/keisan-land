$ErrorActionPreference = "Stop"

try {
    $startup = [Environment]::GetFolderPath("Startup")
    $shortcutPath = Join-Path $startup "Keisan Land AI Company.lnk"
    $starter = Join-Path $PSScriptRoot "tools\start-ai-company-runtime.ps1"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$starter`""
    $shortcut.WorkingDirectory = $PSScriptRoot
    $shortcut.Description = "Start the Keisan Land AI company supervisor at Windows sign-in."
    $shortcut.Save()

    Write-Host "AI company autostart was installed."
}
catch {
    Write-Host ""
    Write-Host "AI company autostart could not be installed." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
