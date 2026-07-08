# deploy-hostinger.ps1
# Faz o build do frontend e publica no branch 'hostinger' do GitHub.
# Execute da raiz do repo: .\deploy-hostinger.ps1

$ErrorActionPreference = "Stop"

$repo     = $PSScriptRoot
$frontend = Join-Path $repo "frontend"
$tmpDir   = Join-Path $env:TEMP "divin-deploy"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    $msg" -ForegroundColor Green }

# --- 1. Salva branch atual ---
$currentBranch = git -C $repo rev-parse --abbrev-ref HEAD
Write-OK "Branch atual: $currentBranch"

# --- 2. Build ---
Write-Step "Buildando o frontend..."
Push-Location $frontend
yarn build
Pop-Location
Write-OK "Build concluído."

# --- 3. Copia build para pasta temporária ---
Write-Step "Preparando arquivos para deploy..."
Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmpDir | Out-Null

Copy-Item "$frontend\build\*" $tmpDir -Recurse -Force

if (Test-Path "$frontend\build\.htaccess") {
    Copy-Item "$frontend\build\.htaccess" $tmpDir -Force
}
Write-OK "Arquivos copiados para $tmpDir"

# --- 4. Muda para o branch hostinger ---
Write-Step "Trocando para branch 'hostinger'..."
git -C $repo checkout hostinger

# --- 5. Limpa arquivos antigos e copia os novos ---
Write-Step "Atualizando arquivos do build..."
git -C $repo rm -rf . --quiet

# Recria .gitignore do branch hostinger
@"
frontend/
migrations/
node_modules/
.claude/
tests/
test_reports/
docs/
memory/
*.md
*.json
yarn.lock
package-lock.json
"@ | Set-Content -Path "$repo\.gitignore" -Encoding utf8

Copy-Item "$tmpDir\*" $repo -Recurse -Force
if (Test-Path "$tmpDir\.htaccess") {
    Copy-Item "$tmpDir\.htaccess" $repo -Force
}

# --- 6. Commit e push ---
Write-Step "Commitando e fazendo push..."
$date = Get-Date -Format "yyyy-MM-dd HH:mm"

git -C $repo add .htaccess index.html asset-manifest.json static/ .gitignore --force
git -C $repo commit -m "Deploy: build $date"
git -C $repo push origin hostinger
Write-OK "Push concluído."

# --- 7. Volta para o branch original ---
Write-Step "Voltando para '$currentBranch'..."
git -C $repo checkout $currentBranch

Write-Host ""
Write-Host "Deploy concluido! Site atualizado no branch 'hostinger'." -ForegroundColor Green
Write-Host "A Hostinger vai detectar automaticamente se o auto-deploy estiver ativado." -ForegroundColor Yellow
