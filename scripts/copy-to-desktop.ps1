# Run this in PowerShell to copy RepoMentor to your Desktop
$source = "\\wsl.localhost\Ubuntu\home\smart_tech\repomentor"
$dest = "$env:USERPROFILE\OneDrive\Desktop\repo master project"

if (-not (Test-Path $source)) {
    $source = "$PSScriptRoot\.."
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null

$exclude = @("node_modules", ".next", ".git")
Get-ChildItem $source | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Copy-Item $_.FullName -Destination $dest -Recurse -Force
}

Write-Host "Done! Project copied to:" $dest
