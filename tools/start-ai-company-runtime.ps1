param(
    [switch]$WaitUntilReady
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$runtimeFile = Join-Path $root "AI_EMPLOYEE_RUNTIME.json"
$stopFile = Join-Path $root "AI_EMPLOYEE_STOP.signal"

function Test-AiCompanyRunning {
    if (-not (Test-Path -LiteralPath $runtimeFile)) {
        return $false
    }

    try {
        $runtime = Get-Content -LiteralPath $runtimeFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $process = Get-Process -Id $runtime.pid -ErrorAction Stop
        $heartbeat = [DateTimeOffset]::Parse($runtime.heartbeat_at)
        $age = [DateTimeOffset]::UtcNow - $heartbeat.ToUniversalTime()
        return $process.ProcessName -eq "node" -and $age.TotalSeconds -lt 90
    }
    catch {
        return $false
    }
}

if (Test-AiCompanyRunning) {
    exit 0
}

if (Test-Path -LiteralPath $stopFile) {
    Remove-Item -LiteralPath $stopFile -Force
}

$node = Get-Command node -ErrorAction Stop
$process = Start-Process `
    -FilePath $node.Source `
    -ArgumentList "tools\ai-company-runtime.mjs" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -PassThru

if ($WaitUntilReady) {
    $deadline = [DateTimeOffset]::Now.AddSeconds(45)
    while ([DateTimeOffset]::Now -lt $deadline) {
        Start-Sleep -Milliseconds 500
        if (Test-AiCompanyRunning) {
            exit 0
        }
        if ($process.HasExited) {
            throw "AI company runtime stopped during startup."
        }
    }
    throw "AI company runtime did not become ready."
}
