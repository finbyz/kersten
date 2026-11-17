$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$body = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-topic-cluster.js'), [System.Text.UTF8Encoding]::new($false))

$styles = @'
  #kersten-topic-cluster-root {
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  #kersten-topic-cluster-root *, #kersten-topic-cluster-root *::before, #kersten-topic-cluster-root *::after {
    box-sizing: border-box;
  }
'@

$header = @"
<!DOCTYPE html>
<!--
  Kersten Topic Cluster Widget
  Usage in ERPNext:
  1. Add above footer on blog, news, and product page Web Templates.
  2. Use web_block in Jinja: {{ web_block({"template": "Topic Cluster Widget", "values": {}}) }}
  3. Or paste widget-topic-cluster-embed-snippet.html into a Custom HTML block.
  4. Optional: data-content-selector=".blog-content" on root element.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Topic Cluster Widget</title>
<style>
$styles
</style>
</head>
<body>
<div id="kersten-topic-cluster-root"></div>
<script>
$body
</script>
</body>
</html>
"@

$snippet = @"
<!-- Kersten Topic Cluster Widget - paste into ERPNext Web Template / Custom HTML block -->
<!-- Jinja: {{ web_block({"template": "Topic Cluster Widget", "values": {}}) }} -->
<!-- Place above footer on blog, news, and product pages -->
<!-- Optional: data-content-selector=".product-description" -->
<style>
$styles
</style>
<div id="kersten-topic-cluster-root"></div>
<script>
$body
</script>
"@

$htmlPath = Join-Path $dir 'widget-topic-cluster.html'
$snippetPath = Join-Path $dir 'widget-topic-cluster-embed-snippet.html'
[System.IO.File]::WriteAllText($htmlPath, $header, [System.Text.UTF8Encoding]::new($true))
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-topic-cluster.html, size: $((Get-Item $htmlPath).Length)"
Write-Host "Created widget-topic-cluster-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
