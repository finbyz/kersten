$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-reviews.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-reviews-widget-root {
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-reviews-widget-root *, #kersten-reviews-widget-root *::before, #kersten-reviews-widget-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Reviews Widget
  Usage in ERPNext:
  1. Add to product, home, or about page Web Templates.
  2. Use web_block in Jinja: {{ web_block({"template": "Reviews Widget", "values": {}}) }}
  3. Or paste widget-reviews-embed-snippet.html into a Custom HTML block.
  4. Optional: data-review-tag="weed|sweeper|winter|all" on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reviews Widget</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-reviews-widget-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Reviews Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Reviews Widget", "values": {}}) }} -->
<!-- Optional: data-review-tag="sweeper" to force review category -->
<style>
$styles
</style>
<div id="kersten-reviews-widget-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-reviews.html'
$snippetPath = Join-Path $dir 'widget-reviews-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-reviews.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-reviews-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
