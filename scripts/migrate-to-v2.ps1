# migrate-to-v2.ps1 — Migrates a project from Method Enterprise Builder Planning v1.x to v2.0.0
# Windows PowerShell version
#
# BREAKING CHANGE in v2.0.0:
#   Rules and skills are now distributed per agent adapter under agents/
#
# Usage:
#   .\scripts\migrate-to-v2.ps1 -ProjectPath "C:\path\to\your-project" -Agent cursor
#   .\scripts\migrate-to-v2.ps1 -ProjectPath "C:\path\to\project" -Agent claude-code -DryRun

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,

    [Parameter(Mandatory=$false)]
    [ValidateSet("cursor", "claude-code", "kimi-code", "windsurf", "antigravity")]
    [string]$Agent = "cursor",

    [switch]$DryRun
)

$MethodDir = Split-Path -Parent $PSScriptRoot

Write-Host "Method directory: $MethodDir"
Write-Host "Project path:     $ProjectPath"
Write-Host "Agent adapter:    $Agent"
Write-Host "Dry run:          $DryRun"
Write-Host ""

if (-not (Test-Path $ProjectPath)) {
    Write-Error "Project path not found: $ProjectPath"
    exit 1
}

switch ($Agent) {
    "cursor" {
        $Src = Join-Path $MethodDir "agents\cursor\.cursor"
        $Dst = Join-Path $ProjectPath ".cursor"
        if ($DryRun) {
            Write-Host "[DRY RUN] Would copy: $Src => $Dst"
        } else {
            Write-Host "Copying Cursor adapter..."
            Copy-Item -Recurse -Force $Src $Dst
            Write-Host "✅ Cursor rules and skills installed at $Dst"
        }
    }

    "claude-code" {
        $ClaudeMd = Join-Path $MethodDir "agents\claude-code\CLAUDE.md"
        $ClaudeDir = Join-Path $MethodDir "agents\claude-code\.claude"
        if ($DryRun) {
            Write-Host "[DRY RUN] Would copy: CLAUDE.md => $ProjectPath\CLAUDE.md"
            Write-Host "[DRY RUN] Would copy: .claude\ => $ProjectPath\.claude\"
        } else {
            Copy-Item $ClaudeMd (Join-Path $ProjectPath "CLAUDE.md") -Force
            Copy-Item -Recurse -Force $ClaudeDir (Join-Path $ProjectPath ".claude")
            Write-Host "✅ Claude Code adapter installed at $ProjectPath"
        }
    }

    "kimi-code" {
        $KimiMd = Join-Path $MethodDir "agents\kimi-code\KIMI.md"
        if ($DryRun) {
            Write-Host "[DRY RUN] Would copy: KIMI.md => $ProjectPath\KIMI.md"
        } else {
            Copy-Item $KimiMd (Join-Path $ProjectPath "KIMI.md") -Force
            Write-Host "✅ Kimi Code adapter installed at $ProjectPath"
        }
    }

    "windsurf" {
        $WindsurfMd = Join-Path $MethodDir "agents\windsurf\WINDSURF.md"
        if ($DryRun) {
            Write-Host "[DRY RUN] Would copy: WINDSURF.md => $ProjectPath\WINDSURF.md"
        } else {
            Copy-Item $WindsurfMd (Join-Path $ProjectPath "WINDSURF.md") -Force
            Write-Host "✅ Windsurf adapter installed at $ProjectPath"
        }
    }

    "antigravity" {
        $AgentsMd = Join-Path $MethodDir "agents\antigravity\AGENTS.md"
        $GeminiMd = Join-Path $MethodDir "agents\antigravity\GEMINI.md"
        $AgentDir = Join-Path $MethodDir "agents\antigravity\.agent"
        if ($DryRun) {
            Write-Host "[DRY RUN] Would copy: AGENTS.md => $ProjectPath\AGENTS.md"
            Write-Host "[DRY RUN] Would copy: GEMINI.md => $ProjectPath\GEMINI.md"
            Write-Host "[DRY RUN] Would copy: .agent\ => $ProjectPath\.agent\"
        } else {
            Copy-Item $AgentsMd (Join-Path $ProjectPath "AGENTS.md") -Force
            Copy-Item $GeminiMd (Join-Path $ProjectPath "GEMINI.md") -Force
            Copy-Item -Recurse -Force $AgentDir (Join-Path $ProjectPath ".agent")
            Write-Host "✅ Antigravity adapter installed at $ProjectPath"
        }
    }
}

if (-not $DryRun) {
    Write-Host ""
    Write-Host "Migration complete. Next steps:"
    Write-Host "1. Close and reopen your editor"
    Write-Host "2. See docs/MIGRATION-v2.md for full v2.0.0 breaking changes"
    if ($Agent -eq "cursor") {
        Write-Host "3. Activate with: /method-enterprise_builder"
    } elseif ($Agent -eq "claude-code") {
        Write-Host "3. Activate with: /plan-enterprise [description]"
    } elseif ($Agent -eq "antigravity") {
        Write-Host "3. Activate with: @skill plan-enterprise"
    }
}
