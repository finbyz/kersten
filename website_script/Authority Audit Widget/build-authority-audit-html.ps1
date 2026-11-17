$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-kersten-authority-audit.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-authority-audit-widget-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-authority-audit-widget-root *, #kersten-authority-audit-widget-root *::before, #kersten-authority-audit-widget-root *::after {
    box-sizing: border-box;
  }
  @media (max-width: 600px) {
    #kersten-authority-audit-widget-root [style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Authority Audit Widget
  Usage in ERPNext:
  1. Create a Web Template Section, or paste into a Web Page HTML block.
  2. Use web_block in Jinja: {{ web_block({"template": "Authority Audit Widget", "values": {}}) }}
  3. Or paste widget-kersten-authority-audit-embed-snippet.html into a Custom HTML block.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Authority Audit Widget</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-authority-audit-widget-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Authority Audit Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Authority Audit Widget", "values": {}}) }} -->
<style>
$styles
</style>
<div id="kersten-authority-audit-widget-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-kersten-authority-audit.html'
$snippetPath = Join-Path $dir 'widget-kersten-authority-audit-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-kersten-authority-audit.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-kersten-authority-audit-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
