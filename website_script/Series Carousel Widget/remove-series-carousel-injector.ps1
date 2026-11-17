$path = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) '..\website_script.js'
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.UTF8Encoding]::new($false))
$new = $lines[0..1336] + $lines[1407..($lines.Length - 1)]
[System.IO.File]::WriteAllLines($path, $new, [System.Text.UTF8Encoding]::new($true))
Write-Host "Removed series carousel injector. New line count: $($new.Length)"
