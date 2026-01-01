# Script PowerShell pour mettre à jour les mots de passe dans users.json

# Chemin vers le fichier users.json
$usersFilePath = "d:\trading-formation\data\users.json"

# Lire le fichier JSON
$jsonContent = Get-Content -Path $usersFilePath -Raw | ConvertFrom-Json

# Fonction pour hacher un mot de passe (version simplifiée sans bcrypt)
function Get-PasswordHash {
    param (
        [string]$password
    )
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hashedBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
    return [System.Convert]::ToBase64String($hashedBytes)
}

# Mettre à jour le mot de passe pour owner_1 (FONDATEUR DIAMOND)
$fondateur = $jsonContent.users | Where-Object { $_.id -eq 'owner_1' }
if ($fondateur) {
    $fondateur.password = Get-PasswordHash -password 'xP4$N8L!eQ0&'
    $fondateur.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Mettre à jour le mot de passe pour owner_2 (PROJET 2K26)
$projet2k26 = $jsonContent.users | Where-Object { $_.id -eq 'owner_2' }
if ($projet2k26) {
    $projet2k26.password = Get-PasswordHash -password 'A9!qR7m@ZK2#'
    $projet2k26.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Sauvegarder les modifications
$jsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $usersFilePath -Encoding UTF8

Write-Host "Mots de passe mis à jour avec succès !" -ForegroundColor Green
