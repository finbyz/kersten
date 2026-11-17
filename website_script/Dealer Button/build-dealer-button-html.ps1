$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-dealer-button.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-dealer-button-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-dealer-button-root *, #kersten-dealer-button-root *::before, #kersten-dealer-button-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Dealer Button Widget
  Usage in ERPNext:
  1. Create a Web Template Section on product page templates.
  2. Use web_block in Jinja: {{ web_block({"template": "Dealer Button", "values": {}}) }}
  3. Or paste widget-dealer-button-embed-snippet.html into a Custom HTML block.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dealer Button</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-dealer-button-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Dealer Button - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Dealer Button", "values": {}}) }} -->
<!-- Place on product page templates below the price / add-to-cart area -->
<style>
$styles
</style>
<div id="kersten-dealer-button-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-dealer-button.html'
$snippetPath = Join-Path $dir 'widget-dealer-button-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-dealer-button.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-dealer-button-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
