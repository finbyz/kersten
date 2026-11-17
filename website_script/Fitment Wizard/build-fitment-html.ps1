$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = [System.IO.File]::ReadAllText((Join-Path $dir 'widget-fitment.js'), [System.Text.UTF8Encoding]::new($false))

$marker = '/* --- KERSTEN UNIVERSAL FITMENT WIZARD'
$markerIdx = $src.IndexOf($marker)
$iifeStart = $src.IndexOf('(function() {', $markerIdx)
$iifeEnd = $src.LastIndexOf('})();')
$body = $src.Substring($iifeStart + '(function() {'.Length, $iifeEnd - $iifeStart - '(function() {'.Length)

$body = [regex]::Replace($body, '// 0\. SMART GATEKEEPER[\s\S]*?if \(!isAttachmentPage && !isHomepage\) return;\s*', '', 1)
$body = [regex]::Replace($body, '// --- 5\. INJECTION & AUTO-FILL ---[\s\S]*?// --- 6\. DYNAMIC SCHEMA ENGINE ---', '', 1)
$body = [regex]::Replace($body, '// --- 6\. DYNAMIC SCHEMA ENGINE ---[\s\S]*?document\.head\.appendChild\(script\);\s*\};\s*', '', 1)
$body = $body -replace '\s*injectWizard\(\);\s*', "`r`n"
$body = $body -replace '\s*injectDynamicSchema\(\);\s*', "`r`n"
$body = $body -replace '\s*setInterval\(\(\) => \{\s*\}, 2000\);\s*', ''

$init = @'

    const mountWizard = () => {
        const root = document.getElementById('kersten-fitment-widget-root');
        if (root && !root.dataset.initialized) {
            root.dataset.initialized = 'true';
            loadWizardLogic(root);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountWizard);
    } else {
        mountWizard();
    }
'@

$body = $body.Trim() + "`r`n`r`n" + $init

$header = @'
<!DOCTYPE html>
<!--
  Kersten Professional Fitment Finder Widget
  Usage in ERPNext:
  1. Create a Web Page (e.g. /fitment-tool-embed) or edit an existing page template.
  2. Paste this entire file content into the page HTML / Custom HTML block.
  3. For iframe embedding on other pages, listen for postMessage kerstenWidgetHeight.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kersten Fitment Finder</title>
<style>
  #kersten-fitment-widget-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    box-sizing: border-box;
  }
  #kersten-fitment-widget-root *, #kersten-fitment-widget-root *::before, #kersten-fitment-widget-root *::after {
    box-sizing: border-box;
  }
  @media (max-width: 600px) {
    #kersten-fitment-widget-root .fitment-select-grid {
      grid-template-columns: 1fr !important;
    }
    #kersten-fitment-widget-root .fitment-action-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>
</head>
<body>
<div id="kersten-fitment-widget-root" class="kersten-fitment-wizard"></div>
<script>
(function() {
  const sendHeight = () => {
    const height = document.documentElement.scrollHeight || document.body.scrollHeight;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ kerstenWidgetHeight: height }, '*');
    }
  };
  window.addEventListener('load', sendHeight);
  window.addEventListener('resize', sendHeight);
  document.addEventListener('click', () => setTimeout(sendHeight, 200));
  new MutationObserver(() => setTimeout(sendHeight, 100)).observe(document.body, { childList: true, subtree: true, attributes: true });
})();
</script>
<script>
(function() {

'@

$footer = @'

})();
</script>
</body>
</html>
'@

$html = $header + $body + $footer
$outPath = Join-Path $dir 'widget-fitment.html'
[System.IO.File]::WriteAllText($outPath, $html, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-fitment.html, size: $((Get-Item $outPath).Length)"

$snippetHeader = @'
<!-- Kersten Fitment Finder - paste into ERPNext Web Template / Custom HTML block -->
<style>
  #kersten-fitment-widget-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    box-sizing: border-box;
  }
  #kersten-fitment-widget-root *, #kersten-fitment-widget-root *::before, #kersten-fitment-widget-root *::after {
    box-sizing: border-box;
  }
  @media (max-width: 600px) {
    #kersten-fitment-widget-root .fitment-select-grid { grid-template-columns: 1fr !important; }
    #kersten-fitment-widget-root .fitment-action-grid { grid-template-columns: 1fr !important; }
  }
</style>
<div id="kersten-fitment-widget-root" class="kersten-fitment-wizard"></div>
<script>
(function() {
  const sendHeight = () => {
    const height = document.documentElement.scrollHeight || document.body.scrollHeight;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ kerstenWidgetHeight: height }, '*');
    }
  };
  window.addEventListener('load', sendHeight);
  window.addEventListener('resize', sendHeight);
  document.addEventListener('click', () => setTimeout(sendHeight, 200));
  new MutationObserver(() => setTimeout(sendHeight, 100)).observe(document.body, { childList: true, subtree: true, attributes: true });
})();
</script>
<script>
(function() {

'@

$snippetFooter = @'

})();
</script>

'@

$snippet = $snippetHeader + $body + $snippetFooter
$snippetPath = Join-Path $dir 'widget-fitment-embed-snippet.html'
[System.IO.File]::WriteAllText($snippetPath, $snippet, [System.Text.UTF8Encoding]::new($true))
Write-Host "Created widget-fitment-embed-snippet.html, size: $((Get-Item $snippetPath).Length)"
