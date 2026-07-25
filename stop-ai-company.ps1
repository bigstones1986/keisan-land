$ErrorActionPreference = "Stop"

try {
    $stopFile = Join-Path $PSScriptRoot "AI_EMPLOYEE_STOP.signal"
    Set-Content -LiteralPath $stopFile -Value "stop" -Encoding ASCII
    Write-Host "AI company stop request was sent."
}
catch {
    Write-Host ""
    Write-Host "AI company could not be stopped." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
