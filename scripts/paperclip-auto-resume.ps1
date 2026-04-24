# paperclip-auto-resume.ps1
# Scheduled auto-resume after token limit reset
# Triggers heartbeats for CEO + all error-state agents
# Created: 2026-04-24, scheduled for 07:05 Europe/Berlin

$ErrorActionPreference = "Continue"
$logFile = "$PSScriptRoot\paperclip-resume-$(Get-Date -Format 'yyyy-MM-dd_HHmm').log"

function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

Log "=== Paperclip Auto-Resume gestartet ==="
Log "Token-Reset war um 06:50. Warte 30s zur Sicherheit..."
Start-Sleep -Seconds 30

$companyId = "f8ea7e27-8d40-438c-967b-fe958a45026b"
$cwd = "c:\Users\carin\.gemini\Konverter Webseite"

# CEO zuerst — er ist der Koordinator
$ceoId = "b039e63d-c3c3-4665-b171-5e4aad5ba826"
Log "Triggere CEO Heartbeat ($ceoId)..."
try {
    $result = & npx paperclipai heartbeat run --agent-id $ceoId 2>&1
    Log "CEO Heartbeat Result: $($result | Out-String)"
} catch {
    Log "CEO Heartbeat Fehler: $_"
}

Log "Warte 60s bevor Error-Agenten getriggert werden..."
Start-Sleep -Seconds 60

# Error-state Agenten die durch Token-Limit gestoppt wurden
$errorAgents = @(
    @{ name = "performance-auditor";  id = "0eadd722-298e-4d11-93f4-e7bdff458106" }
    @{ name = "merged-critic";        id = "6e9e54cc-77b7-439c-b535-2cc6eccdc0ca" }
    @{ name = "Tool-Builder";         id = "deea8a61-3c70-4d41-b43a-bc104b9b45ac" }
    @{ name = "platform-engineer";    id = "08447ccc-1d37-4ea1-b720-ba8c99b3a77e" }
    @{ name = "design-critic";        id = "4d37a3ac-dcbe-4ee9-8a50-ccbd9afbd2d2" }
    @{ name = "a11y-auditor";         id = "2bb73bc2-93cf-4524-8494-e40fa3824942" }
    @{ name = "content-critic";       id = "5e3d37d3-ebd5-41eb-98c7-1b356f5a99f3" }
    @{ name = "security-auditor";     id = "58a46453-6b82-4bd2-b78f-8339d131e0f3" }
    @{ name = "conversion-critic";    id = "7de6eaad-9ebf-4a05-b80c-88d753d9b08c" }
)

foreach ($agent in $errorAgents) {
    Log "Triggere $($agent.name) ($($agent.id))..."
    try {
        $result = & npx paperclipai heartbeat run --agent-id $($agent.id) 2>&1
        Log "$($agent.name) Result: $($result | Out-String)"
    } catch {
        Log "$($agent.name) Fehler: $_"
    }
    # 15s Pause zwischen Agenten um API nicht zu überlasten
    Start-Sleep -Seconds 15
}

Log "=== Alle Heartbeats getriggert. Paperclip sollte jetzt weiterlaufen. ==="
Log "Log gespeichert unter: $logFile"

# Scheduled Task aufräumen (einmalig)
try {
    Unregister-ScheduledTask -TaskName "PaperclipAutoResume" -Confirm:$false -ErrorAction SilentlyContinue
    Log "Scheduled Task 'PaperclipAutoResume' entfernt (einmalige Ausführung)."
} catch {
    Log "Scheduled Task konnte nicht entfernt werden (evtl. bereits weg)."
}
