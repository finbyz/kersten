$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-comp-eng-veto.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-veto-table-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-veto-table-root *, #kersten-veto-table-root *::before, #kersten-veto-table-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Competitive Engineering Veto Widget
  Usage in ERPNext:
  1. Create a Web Template Section, or paste into a Web Page HTML block.
  2. Use web_block in Jinja: {{ web_block({"template": "Competitive Engineering Veto", "values": {}}) }}
  3. Or paste widget-comp-eng-veto-embed-snippet.html into a Custom HTML block.
  4. Optional: force comparison type with data-veto-context="kubota|hatz|electric"
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Competitive Engineering Veto</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-veto-table-root" data-veto-context="hatz"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Competitive Engineering Veto - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Competitive Engineering Veto", "values": {}}) }} -->
<!-- Optional: data-veto-context="kubota" | "hatz" | "electric" to force comparison table -->
<style>
$styles
</style>
<div id="kersten-veto-table-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-comp-eng-veto.html'
$snippetPath = Join-Path $dir 'widget-comp-eng-veto-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-comp-eng-veto.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-comp-eng-veto-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
