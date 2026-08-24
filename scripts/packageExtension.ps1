$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($npmCmd)) {
    throw "No se encontro npm.cmd en PATH. Instala Node.js o corrige PATH."
}

& $npmCmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Fallo npm run build"
}

$outDir = Join-Path $root "artifacts"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$packageJsonPath = Join-Path $root "package.json"
$packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
$version = [string]$packageJson.version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "No se encontro version en package.json"
}

$unpackedDir = Join-Path $outDir "unpacked-v$version"
if (Test-Path $unpackedDir) {
    Remove-Item -Path $unpackedDir -Recurse -Force
}

New-Item -ItemType Directory -Path $unpackedDir | Out-Null

$items = @(
    "manifest.json",
    "dist",
    "icons",
    "README.md"
)

foreach ($item in $items) {
    Copy-Item -Path (Join-Path $root $item) -Destination $unpackedDir -Recurse -Force
}

$zipName = "chrome-autofill-extension-v$version.zip"
$zipPath = Join-Path $outDir $zipName

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path (Join-Path $unpackedDir "*") -DestinationPath $zipPath -Force
Write-Output "Unpacked folder created: $unpackedDir"
Write-Output "Package created: $zipPath"
