$root = Split-Path -Parent $PSScriptRoot
$startup = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startup "filetrx.lnk"
$launcher = Join-Path $root "launch-filetrx.cmd"
$wshell = New-Object -ComObject WScript.Shell
$shortcut = $wshell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcher
$shortcut.WorkingDirectory = $root
$shortcut.IconLocation = "%SystemRoot%\\System32\\SHELL32.dll,220"
$shortcut.Save()
Write-Output "Created startup shortcut: $shortcutPath"