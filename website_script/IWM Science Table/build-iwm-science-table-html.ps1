$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-iwm-science-table.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #iwm-science-table-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #iwm-science-table-root *, #iwm-science-table-root *::before, #iwm-science-table-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten IWM Science Table Widget
  Usage in ERPNext:
  1. Create a Web Template Section, or paste into a Web Page HTML block.
  2. Use web_block in Jinja: {{ web_block({"template": "IWM Science Table", "values": {}}) }}
  3. Or paste widget-iwm-science-table-embed-snippet.html into a Custom HTML block.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IWM Science Table</title>
<style>
$styles
</style>
</head>
<body>
<div id="iwm-science-table-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten IWM Science Table - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "IWM Science Table", "values": {}}) }} -->
<style>
$styles
</style>
<div id="iwm-science-table-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-iwm-science-table.html'
$snippetPath = Join-Path $dir 'widget-iwm-science-table-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-iwm-science-table.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-iwm-science-table-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
