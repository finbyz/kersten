$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-tech-profiler.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-tech-profiler-root {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto 25px;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-tech-profiler-root *, #kersten-tech-profiler-root *::before, #kersten-tech-profiler-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Tech Profiler Widget
  Usage in ERPNext:
  1. Add to product page Web Templates (above spec table or fitment wizard).
  2. Use web_block in Jinja: {{ web_block({"template": "Tech Profiler Widget", "values": {}}) }}
  3. Or paste widget-tech-profiler-embed-snippet.html into a Custom HTML block.
  4. Optional: data-product-type="plough|spreader|power-unit" on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tech Profiler Widget</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-tech-profiler-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Tech Profiler Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Tech Profiler Widget", "values": {}}) }} -->
<!-- Place on plough, spreader, sweeper, snow blower, and gravel renovator product pages -->
<!-- Optional: data-product-type="plough" -->
<style>
$styles
</style>
<div id="kersten-tech-profiler-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-tech-profiler.html'
$snippetPath = Join-Path $dir 'widget-tech-profiler-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-tech-profiler.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-tech-profiler-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
