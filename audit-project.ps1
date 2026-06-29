# audit-project.ps1

$ErrorActionPreference = "Continue"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = ".\reports"
$reportFile = Join-Path $reportDir "error-report-$timestamp.txt"

if (!(Test-Path $reportDir)) {
New-Item -ItemType Directory -Path $reportDir | Out-Null
}

function Write-Section {
param([string]$Title)

```
Add-Content $reportFile ""
Add-Content $reportFile ("=" * 80)
Add-Content $reportFile $Title
Add-Content $reportFile ("=" * 80)
Add-Content $reportFile ""
```

}

function Run-Command {
param(
[string]$Title,
[string]$Command
)

```
Write-Host "Running $Title..."
Write-Section $Title

try {
    $output = Invoke-Expression "$Command 2>&1"
    if ($output) {
        $output | Out-File -Append $reportFile
    }
    else {
        "No issues found." | Out-File -Append $reportFile
    }
}
catch {
    $_ | Out-File -Append $reportFile
}
```

}

"Project Audit Report" | Out-File $reportFile
"Generated: $(Get-Date)" | Out-File -Append $reportFile
"" | Out-File -Append $reportFile

# Empty files

Write-Section "EMPTY FILES"

Get-ChildItem -File -Recurse |
Where-Object {
$*.Length -eq 0 -and.Length -eq 0 -and
$*.FullName -notmatch '\node_modules\' -and.FullName -notmatch '\node_modules\' -and
$*.FullName -notmatch '\.next\' -and.FullName -notmatch '\.next\' -and
$*.FullName -notmatch '\dist\' -and.FullName -notmatch '\dist\' -and
$*.FullName -notmatch '\build\' -and.FullName -notmatch '\build\' -and
$*.FullName -notmatch '\coverage\'.FullName -notmatch '\coverage\'
} |
Resolve-Path -Relative |
Out-File -Append $reportFile

# TypeScript

Run-Command `    -Title "TYPESCRIPT ERRORS (tsc --noEmit)"`
-Command "npx tsc --noEmit"

# ESLint

Run-Command `    -Title "ESLINT"`
-Command "npm run lint"

# Next.js build

Run-Command `    -Title "NEXT BUILD"`
-Command "npm run build"

# Circular dependencies

if (Get-Command npx -ErrorAction SilentlyContinue) {
try {
npx madge --version *> $null
Run-Command `            -Title "CIRCULAR DEPENDENCIES (madge)"`
-Command "npx madge --circular src"
}
catch {}
}

# Unused exports

if (Get-Command npx -ErrorAction SilentlyContinue) {
try {
npx ts-prune --help *> $null
Run-Command `            -Title "UNUSED EXPORTS (ts-prune)"`
-Command "npx ts-prune"
}
catch {}
}

Write-Host ""
Write-Host "Audit complete."
Write-Host "Report saved to:"
Write-Host $reportFile
