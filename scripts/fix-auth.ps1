# Script PowerShell pour corriger l'authentification
# Ce script va mettre à jour les mots de passe avec un hachage bcrypt valide

# Charger l'assembly pour bcrypt
Add-Type -AssemblyName System.Web

# Fonction pour hacher un mot de passe avec bcrypt
function Get-BcryptHash {
    param (
        [string]$password
    )
    
    # Utiliser node pour générer un hachage bcrypt
    $nodeScript = @"
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('$password', salt);
    console.log(hash);
"@
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript | Out-File -FilePath $tempFile -Encoding utf8
    
    try {
        $hash = node $tempFile
        return $hash.Trim()
    } finally {
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

# Chemin vers le fichier users.json
$usersFilePath = "d:\\trading-formation\\data\\users.json"

# Lire le fichier JSON
$jsonContent = Get-Content -Path $usersFilePath -Raw | ConvertFrom-Json

# Mettre à jour le mot de passe pour owner_1 (FONDATEUR DIAMOND)
$fondateur = $jsonContent.users | Where-Object { $_.id -eq 'owner_1' }
if ($fondateur) {
    Write-Host "Mise à jour du mot de passe pour FONDATEUR DIAMOND..." -ForegroundColor Yellow
    $fondateur.password = Get-BcryptHash -password 'xP4$N8L!eQ0&'
    $fondateur.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    Write-Host "Mot de passe mis à jour pour FONDATEUR DIAMOND" -ForegroundColor Green
}

# Mettre à jour le mot de passe pour owner_2 (PROJET 2K26)
$projet2k26 = $jsonContent.users | Where-Object { $_.id -eq 'owner_2' }
if ($projet2k26) {
    Write-Host "Mise à jour du mot de passe pour PROJET 2K26..." -ForegroundColor Yellow
    $projet2k26.password = Get-BcryptHash -password 'A9!qR7m@ZK2#'
    $projet2k26.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    Write-Host "Mot de passe mis à jour pour PROJET 2K26" -ForegroundColor Green
}

# Sauvegarder les modifications
$jsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $usersFilePath -Encoding UTF8 -Force

Write-Host "`nMise à jour terminée avec succès !" -ForegroundColor Green
Write-Host "Les mots de passe ont été mis à jour avec des hachages bcrypt valides." -ForegroundColor Green
