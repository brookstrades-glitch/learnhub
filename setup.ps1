# LearnHub one-shot setup for Windows 11. Safe to re-run; finished steps are skipped.
# Fresh machine: paste the one-liner from README.md into PowerShell (not as admin).

$ErrorActionPreference = 'Continue'
$Dir = $PSScriptRoot
$Harness = Join-Path $Dir 'harness'
$ClaudeHome = Join-Path $HOME '.claude'

function Say($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "    $m" -ForegroundColor Yellow }
function Has($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
  $local = Join-Path $HOME '.local\bin'
  if ((Test-Path $local) -and ($env:Path -notlike "*$local*")) { $env:Path += ";$local" }
}
function Need($cmd, $wingetId) {
  if (Has $cmd) { return }
  Write-Host "    installing $wingetId"
  winget install -e --id $wingetId --silent --source winget --accept-source-agreements --accept-package-agreements | Out-Null
  Refresh-Path
  if (-not (Has $cmd)) { throw "$cmd still not found after installing $wingetId. Close PowerShell, open a new one, and re-run setup.ps1." }
}
function Run($what) {
  & $what[0] $what[1..($what.Length - 1)]
  if ($LASTEXITCODE -ne 0) { throw "Failed: $($what -join ' ')" }
}
function Encode-DbPassword($u) {
  if ($u -match '^(postgres(?:ql)?://[^:/]+:)(.*)@([^@]+)$') {
    $head, $pw, $tail = $Matches[1], $Matches[2], $Matches[3]
    if ($pw -notmatch '%[0-9A-Fa-f]{2}') { $pw = [Uri]::EscapeDataString($pw) }
    return $head + $pw + '@' + $tail
  }
  $u
}
function Write-NoBom($path, $text) { [IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding $false)) }

try {
  Say '1/9  Allowing local scripts (npm, vercel and claude need this)'
  try { Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force -ErrorAction Stop } catch { Warn 'Could not change execution policy (managed by your organisation?). Continuing.' }

  Say '2/9  Installing Git, Node.js, GitHub CLI, VS Code'
  Refresh-Path
  Need git  'Git.Git'
  Need node 'OpenJS.NodeJS.LTS'
  Need gh   'GitHub.cli'
  Need code 'Microsoft.VisualStudioCode'
  if (-not (Has vercel)) { Run @('npm', 'install', '-g', 'vercel', '--no-audit', '--no-fund'); Refresh-Path }
  Write-Host "    node $(node -v), git $((git --version) -replace 'git version ', '')"

  Say '3/9  Installing Claude Code'
  if (-not (Has claude)) {
    Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
    Refresh-Path
  }
  if (-not (Has claude)) { throw 'Claude Code did not install. Close PowerShell, open a new one, and re-run setup.ps1.' }

  Say '4/9  Git identity'
  if (-not (git config --global user.name)) { git config --global user.name (Read-Host 'Your name') }
  if (-not (git config --global user.email)) { git config --global user.email (Read-Host 'Your GitHub email') }
  git config --global init.defaultBranch main
  git config --global core.autocrlf true

  Say '5/9  Logging in to GitHub and Vercel (a browser opens for each)'
  gh auth status *> $null
  if ($LASTEXITCODE -ne 0) { Run @('gh', 'auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web') }
  gh auth setup-git *> $null
  vercel whoami *> $null
  if ($LASTEXITCODE -ne 0) { Run @('vercel', 'login') }

  Say '6/9  Getting the latest code'
  Set-Location $Dir
  git pull -q --ff-only
  Run @('npm', 'install', '--no-audit', '--no-fund')

  Say '7/9  Setting up Claude for vibe coding'
  New-Item -ItemType Directory -Force (Join-Path $ClaudeHome 'skills') | Out-Null
  $globalMd = Join-Path $ClaudeHome 'CLAUDE.md'
  if (-not (Test-Path $globalMd)) { Copy-Item (Join-Path $Harness 'CLAUDE.md') $globalMd }
  elseif ((Get-Content $globalMd -Raw) -notmatch 'harness:learnhub') { Warn "$globalMd already exists and was left alone. Merge harness\CLAUDE.md into it by hand." }
  $settings = Join-Path $ClaudeHome 'settings.json'
  if (-not (Test-Path $settings)) { Copy-Item (Join-Path $Harness 'settings.json') $settings }
  else { Warn "$settings already exists and was left alone." }
  Copy-Item (Join-Path $Harness 'skills\*') (Join-Path $ClaudeHome 'skills') -Recurse -Force
  claude plugin marketplace add anthropics/claude-plugins-official *> $null
  claude plugin install vercel@claude-plugins-official *> $null
  if ($LASTEXITCODE -ne 0) { Warn 'Vercel plugin not installed. Inside Claude, run: /plugin install vercel@claude-plugins-official' }
  code --install-extension anthropic.claude-code --force *> $null

  if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Force $PROFILE | Out-Null }
  if ((Get-Content $PROFILE -Raw) -notmatch 'harness:learnhub') {
    Add-Content $PROFILE @"

# harness:learnhub
function lh { Set-Location '$Dir'; claude @args }
function lhcode { code '$Dir' }
"@
  }

  Say '8/9  Supabase keys'
  $envFile = Join-Path $Dir '.env.local'
  $vals = @{}
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) { if ($line -match '^\s*([A-Z_]+)=(.*)$') { $vals[$Matches[1]] = $Matches[2].Trim() } }
  }
  $fields = @(
    @{ k = 'NEXT_PUBLIC_SUPABASE_URL'; q = 'Project URL (Project Settings > API, looks like https://xxxx.supabase.co)'; ok = '^https://[a-z0-9]+\.supabase\.co/?$' },
    @{ k = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'; q = 'Publishable / anon public key (starts with sb_publishable_ or eyJ)'; ok = '^(sb_publishable_|eyJ)\S+$' },
    @{ k = 'DATABASE_URL'; q = 'Connection string (Connect > Transaction pooler, ends in :6543/postgres, password filled in)'; ok = '^postgres(ql)?://[^\s\[\]]+:6543/postgres$' },
    @{ k = 'ADMIN_EMAIL'; q = 'Your email (this account becomes admin)'; ok = '^\S+@\S+\.\S+$' }
  )
  $bad = @($fields | Where-Object { -not ($vals[$_.k] -match $_.ok) })
  if ($bad.Count -gt 0) {
    Write-Host @'

Open https://supabase.com/dashboard in your browser.
  - No project yet? New project -> any name -> set a database password (save it in your password manager) -> wait ~2 min
  - Never use the "secret" or "service_role" key here.

Paste each value below (right-click pastes in PowerShell).
'@
    foreach ($f in $bad) {
      do {
        $v = (Read-Host $f.q).Trim()
        if ($v -notmatch $f.ok) { Warn 'That does not look right. Check the hint in brackets and paste it again.' }
      } until ($v -match $f.ok)
      $vals[$f.k] = $v
    }
  }
  $encoded = Encode-DbPassword $vals['DATABASE_URL']
  if ($bad.Count -gt 0 -or $encoded -ne $vals['DATABASE_URL']) {
    $vals['DATABASE_URL'] = $encoded
    Write-NoBom $envFile (($fields | ForEach-Object { "$($_.k)=$($vals[$_.k])" }) -join "`n")
  }
  Write-Host '    .env.local saved'

  Say '9/9  Creating database tables'
  Run @('npm', 'run', 'db:push')
}
catch {
  Write-Host "`nSETUP STOPPED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'Fix that, then run this again. Finished steps are skipped:'
  Write-Host "    powershell -ExecutionPolicy Bypass -File `"$Dir\setup.ps1`""
  exit 1
}

Write-Host @"

=====================================================================
  SETUP DONE. Close this window and open a new PowerShell window.
=====================================================================

Start building:      lh            (opens Claude in your project)
  first time only, Claude asks you to log in with your Claude account
In VS Code instead:  lhcode        (then click the Claude icon, top right)

Read VIBE-CODING.md in the project folder. It is the whole playbook.

See the site on this computer:  ask Claude "start the dev server"
  then open http://localhost:3000 and sign up with your admin email.
"@

$go = Read-Host 'Put it on the internet now (Vercel)? [y/N]'
if ($go -match '^[Yy]') { npm run deploy }
