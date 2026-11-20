$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-logistics-bar.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-logistics-bar-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-logistics-bar-root *, #kersten-logistics-bar-root *::before, #kersten-logistics-bar-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Site Logistics Bar Widget
  Usage in ERPNext:
  1. Add to product page Web Template above the specification table.
  2. Use web_block in Jinja: {{ web_block({"template": "Logistics Bar", "values": {}}) }}
  3. Or paste widget-logistics-bar-embed-snippet.html into a Custom HTML block.
  4. Optional: data-weight, data-width, data-noise on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Logistics Bar</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-logistics-bar-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Logistics Bar - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Logistics Bar", "values": {}}) }} -->
<!-- Place above specification table on product pages -->
<!-- Optional: data-weight="650" data-width="95" data-noise="78" -->
<style>
$styles
</style>
<div id="kersten-logistics-bar-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-logistics-bar.html'
$snippetPath = Join-Path $dir 'widget-logistics-bar-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-logistics-bar.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-logistics-bar-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
