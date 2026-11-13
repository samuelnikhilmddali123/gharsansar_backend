# ================================================================
# Ghar Sansar 24/7 Always-On Guardian Watchdog
# Prevents Windows Sleep & Auto-Restarts Servers & Console
# ================================================================

$ErrorActionPreference = "Continue"

$rootDir = "D:\stackvil\gharsansar_backend-main\gharsansar_backend-main"
$logFile = Join-Path $rootDir "guardian.log"
$pidFile = Join-Path $rootDir ".guardian.pid"
$stopSignal = Join-Path $rootDir ".guardian_stop"
$batPath = Join-Path $rootDir "START_SERVERS.bat"
$backendBat = Join-Path $rootDir "backend\start-server.bat"
$frontendBat = Join-Path $rootDir "ghar_sansar_frontend\start-frontend.bat"
$tunnelBat = Join-Path $rootDir "start-official-tunnel.bat"

function Log-Message([string]$msg) {
    $ts = [DateTime]::Now.ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$ts] $msg"
    try {
        Add-Content -Path $logFile -Value $line -ErrorAction SilentlyContinue
    } catch {}
}

# 1. PID-based single instance check
if (Test-Path $pidFile) {
    $oldPid = Get-Content -Path $pidFile -ErrorAction SilentlyContinue
    if ($oldPid) {
        $oldProc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
        if ($oldProc -and $oldProc.Id -ne $PID) {
            Log-Message "Guardian already running with PID $oldPid. Exiting duplicate instance $PID."
            exit 0
        }
    }
}
$PID | Set-Content -Path $pidFile -Force -ErrorAction SilentlyContinue
Log-Message "Guardian started with PID $PID. PID file recorded."

# 2. Permanent Sleep Blocker via Win32 API
try {
    $code = @"
using System;
using System.Runtime.InteropServices;
public static class WinPower {
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
}
"@
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
    # ES_CONTINUOUS (0x80000000) | ES_SYSTEM_REQUIRED (0x00000001) | ES_AWAYMODE_REQUIRED (0x00000040) = 2147483713
    $ret = [WinPower]::SetThreadExecutionState([uint32]2147483713)
    Log-Message "SetThreadExecutionState configured: $ret (Continuous awake active)"
} catch {
    Log-Message "Notice in SetThreadExecutionState: $_"
}

# 3. Ensure powercfg standby/hibernate timeouts are zero
try {
    & powercfg /change standby-timeout-ac 0 2>$null
    & powercfg /change standby-timeout-dc 0 2>$null
    & powercfg /change hibernate-timeout-ac 0 2>$null
    & powercfg /change hibernate-timeout-dc 0 2>$null
    & powercfg /change disk-timeout-ac 0 2>$null
    & powercfg /change disk-timeout-dc 0 2>$null
    & powercfg /change monitor-timeout-dc 0 2>$null
    Log-Message "Powercfg timeouts verified and set to 0 (Never Sleep)."
} catch {
    Log-Message "Notice in powercfg: $_"
}

$lastLauncherStart = [DateTime]::MinValue
$lastBackendStart = [DateTime]::MinValue
$lastFrontendStart = [DateTime]::MinValue
$lastTunnelStart = [DateTime]::MinValue
$lastPowerCheck = [DateTime]::MinValue

while ($true) {
    try {
        # Check if a clean stop was requested
        if (Test-Path $stopSignal) {
            Log-Message "Stop signal detected (.guardian_stop). Guardian exiting cleanly."
            break
        }

        $now = [DateTime]::UtcNow

        # Re-enforce sleep prevention every 60 seconds
        if (($now - $lastPowerCheck).TotalSeconds -ge 60) {
            [WinPower]::SetThreadExecutionState([uint32]2147483713)
            $lastPowerCheck = $now
        }

        # 1. Check Backend (Port 5001)
        $backendPort = Get-NetTCPConnection -LocalPort 5001 -State Listen -ErrorAction SilentlyContinue
        if (-not $backendPort) {
            if (($now - $lastBackendStart).TotalSeconds -ge 10) {
                $lastBackendStart = $now
                Log-Message "Backend (Port 5001) is down. Restarting backend server..."
                Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$backendBat`"" -WorkingDirectory (Join-Path $rootDir "backend")
            }
        }

        # 2. Check Frontend (Port 5173)
        $frontendPort = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
        if (-not $frontendPort) {
            if (($now - $lastFrontendStart).TotalSeconds -ge 10) {
                $lastFrontendStart = $now
                Log-Message "Frontend (Port 5173) is down. Restarting frontend server..."
                Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$frontendBat`"" -WorkingDirectory (Join-Path $rootDir "ghar_sansar_frontend")
            }
        }

        # 3. Check Cloudflare Tunnel (cloudflared.exe specifically for Ghar Sansar)
        $cfProc = Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*" -or
            $_.CommandLine -like "*1ae0eab3-de49-415c-bd88-dd0c936fc589*"
        }
        if (-not $cfProc) {
            if (($now - $lastTunnelStart).TotalSeconds -ge 10) {
                $lastTunnelStart = $now
                Log-Message "Ghar Sansar Cloudflare Tunnel is down. Restarting tunnel..."
                Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$tunnelBat`"" -WorkingDirectory $rootDir
            }
        }
    } catch {
        Log-Message "Error in guardian loop: $_"
    }

    Start-Sleep -Seconds 3
}

Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
Log-Message "Guardian shutdown complete."
