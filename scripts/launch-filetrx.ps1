$root = Split-Path -Parent $PSScriptRoot
$port = 8787
$uri = "http://127.0.0.1:$port/api/state"
$running = $false

try {
  Invoke-WebRequest -UseBasicParsing -Uri $uri -TimeoutSec 2 | Out-Null
  $running = $true
} catch {
  $running = $false
}

if (-not $running) {
  Start-Process -FilePath node -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 2
}

Start-Process "http://127.0.0.1:$port"