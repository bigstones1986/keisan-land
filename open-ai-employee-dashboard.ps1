$ErrorActionPreference = "Stop"

try {
    Set-Location -LiteralPath $PSScriptRoot

    $node = Get-Command node -ErrorAction Stop
    & $node.Source "tools\build-employee-dashboard.mjs"
    if ($LASTEXITCODE -ne 0) {
        throw "Dashboard data update failed."
    }

    $dashboard = Join-Path $PSScriptRoot "employee-dashboard\index.html"
    if (-not (Test-Path -LiteralPath $dashboard)) {
        throw "Dashboard file was not found."
    }

    Start-Process -FilePath $dashboard
}
catch {
    Write-Host ""
    Write-Host "AI employee dashboard could not be opened." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
