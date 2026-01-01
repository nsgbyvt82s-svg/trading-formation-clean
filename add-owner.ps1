Add-Type -AssemblyName System.Web

# Fonction pour hacher le mot de passe avec bcrypt
function Get-BcryptHash {
    param (
        [string]$password
    )
    
    $salt = [BCrypt.BCryptHelper]::GenerateSalt()
    return [BCrypt.BCryptHelper]::HashPassword($password, $salt)
}

# Chemin du fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'

# Lire le fichier users.json
$json = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Créer un nouvel utilisateur OWNER
$newOwner = @{
    id = "owner_$(New-Guid)"
    email = "vexx@diamondtrade.com"
    password = "A9!qR7m@ZK2#"  # Le mot de passe en clair
    name = "Vexx Owner"
    username = "vexx_owner"
    role = "OWNER"
    status = "ACTIVE"
    emailVerified = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Hacher le mot de passe
$hashedPassword = [BCrypt.BCryptHelper]::HashPassword($newOwner.password, [BCrypt.BCryptHelper]::GenerateSalt())
$newOwner.password = $hashedPassword

# Ajouter le nouvel utilisateur à la liste
$json.users += $newOwner

# Écrire les modifications dans le fichier
$json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force

Write-Host "Nouvel utilisateur OWNER ajouté avec succès !"
Write-Host "Email: $($newOwner.email)"
Write-Host "Mot de passe: A9!qR7m@ZK2#"
