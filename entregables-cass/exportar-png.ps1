$Pptx = Join-Path $PSScriptRoot "CASS_Balcarce_Juego_patologico_adolescentes.pptx"
$OutDir = Join-Path $PSScriptRoot "preview-v2"
if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir | Out-Null
$app = New-Object -ComObject PowerPoint.Application
$pres = $app.Presentations.Open($Pptx, $true, $false, $false)
$pres.Export($OutDir, "PNG", 1280, 720)
$count = $pres.Slides.Count
$pres.Close()
$app.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($app) | Out-Null
Write-Output "slides=$count"
(Get-ChildItem $OutDir).Count
