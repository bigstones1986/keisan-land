$ErrorActionPreference = "Stop"

try {
    $startup = [Environment]::GetFolderPath("Startup")
    $shortcutPath = Join-Path $startup "Keisan Land AI Company.lnk"
    if (Test-Path -LiteralPath $shortcutPath) {
        Remove-Item -LiteralPath $shortcutPath -Force
    }
    Write-Host "AI company autostart was removed."
}
catch {
    Write-Host ""
    Write-Host "AI company autostart could not be removed." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
