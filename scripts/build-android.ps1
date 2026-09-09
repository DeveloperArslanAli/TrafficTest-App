<#
.SYNOPSIS
  Automated Gradle Build script for TrafficTest Android application.
.EXAMPLE
  .\scripts\build-android.ps1
  .\scripts\build-android.ps1 -Type apk
  .\scripts\build-android.ps1 -Type aab
  .\scripts\build-android.ps1 -Clean
#>

param(
  [ValidateSet('all', 'apk', 'aab')]
  [string]$Type = 'all',
  [switch]$Clean,
  [switch]$Debug
)

$argsList = @("scripts/build-android.js", "--type", $Type)
if ($Clean) { $argsList += "--clean" }
if ($Debug) { $argsList += "--debug" }

node @argsList
