$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-series-carousel.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-series-carousel-root {
    display: none;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Series Carousel Widget (Schema.org ItemList)
  Usage in ERPNext:
  1. Add to series/range product listing page Web Templates (bottom of page).
  2. Use web_block in Jinja: {{ web_block({"template": "Series Carousel Widget", "values": {}}) }}
  3. Or paste widget-series-carousel-embed-snippet.html into a Custom HTML block.
  4. Optional: data-series-name="Kersten UBS Series" on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Series Carousel Widget</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-series-carousel-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Series Carousel Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Series Carousel Widget", "values": {}}) }} -->
<!-- Schema-only: injects ItemList JSON-LD from product cards on the page -->
<!-- Optional: data-series-name="Kersten K-Series" -->
<style>
$styles
</style>
<div id="kersten-series-carousel-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-series-carousel.html'
$snippetPath = Join-Path $dir 'widget-series-carousel-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-series-carousel.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-series-carousel-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
