$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-HAVS.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-havs-widget-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-havs-widget-root *, #kersten-havs-widget-root *::before, #kersten-havs-widget-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten HAVS Safety Comparator Widget
  Usage in ERPNext:
  1. Add to product page Web Template below the specification table.
  2. Use web_block in Jinja: {{ web_block({"template": "HAVS Widget", "values": {}}) }}
  3. Or paste widget-HAVS-embed-snippet.html into a Custom HTML block.
  4. Optional: data-vibration-level and data-machine-name on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HAVS Safety Comparator</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-havs-widget-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten HAVS Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "HAVS Widget", "values": {}}) }} -->
<!-- Place below specification table on product pages -->
<!-- Optional: data-vibration-level="2.5" data-machine-name="Kersten K820" -->
<style>
$styles
</style>
<div id="kersten-havs-widget-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-HAVS.html'
$snippetPath = Join-Path $dir 'widget-HAVS-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-HAVS.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-HAVS-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
