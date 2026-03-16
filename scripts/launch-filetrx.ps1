$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$port = 8787
$stateUri = "http://127.0.0.1:$port/api/state"
$appUri = "http://127.0.0.1:$port"
$logPath = Join-Path $root "launch-filetrx.log"
$nodePath = $null

function Write-Log([string]$Message) {
  $line = "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] $Message"
  Add-Content -Path $logPath -Value $line
}

function Is-ServerUp {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri $stateUri -TimeoutSec 2 | Out-Null
    return $true
  } catch {
    return $false
  }
}

try {
  Write-Log "Launcher started."

  if (-not (Is-ServerUp)) {
    try {
      $nodePath = (Get-Command node -ErrorAction Stop).Source
    } catch {
      if (Test-Path "C:\Program Files\nodejs\node.exe") {
        $nodePath = "C:\Program Files\nodejs\node.exe"
      }
    }

    if (-not $nodePath) {
      throw "Node.js was not found."
    }

    Write-Log "Starting server with: $nodePath"
    Start-Process -FilePath $nodePath -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden | Out-Null

    $up = $false
    for ($i = 0; $i -lt 10; $i++) {
      Start-Sleep -Milliseconds 400
      if (Is-ServerUp) {
        $up = $true
        break
      }
    }

    if (-not $up) {
      throw "Server did not respond on $stateUri after startup attempt."
    }
  } else {
    Write-Log "Server already running."
  }

  Write-Log "Opening app URI: $appUri"
  Start-Process $appUri
  exit 0
} catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  throw
}