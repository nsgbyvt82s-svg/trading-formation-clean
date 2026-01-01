# Script pour générer un mot de passe sécurisé et mettre à jour users.json

# Fonction pour générer un hash bcrypt avec .NET
function Get-BcryptHash {
    param (
        [string]$password,
        [int]$workFactor = 10
    )
    
    $r = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $salt = New-Object byte[](16)
    $r.GetBytes($salt)
    
    $hasher = New-Object -TypeName System.Security.Cryptography.Rfc2898DeriveBytes -ArgumentList @(
        $password,
        $salt,
        10000,  # Nombre d'itérations
        [System.Security.Cryptography.HashAlgorithmName]::SHA256
    )
    
    $hash = $hasher.GetBytes(32)
    
    # Format: $2a$10$[salt][hash] (simplifié pour l'exemple)
    # Note: Ceci est une simulation simplifiée, en production utilisez une bibliothèque bcrypt complète
    $saltBase64 = [Convert]::ToBase64String($salt)
    $hashBase64 = [Convert]::ToBase64String($hash)
    
    # Format de hachage simplifié pour l'exemple
    return "`$2a`$$workFactor`$$saltBase64$hashBase64"
}

# Chemin vers le fichier users.json
$usersPath = "d:\trading-formation\data\users.json"

# Lire le contenu actuel
$usersData = Get-Content -Path $usersPath -Raw | ConvertFrom-Json

# Trouver l'utilisateur vexx_owner
$user = $usersData.users | Where-Object { $_.username -eq 'vexx_owner' }

if ($user) {
    # Générer un mot de passe sécurisé
    $newPassword = [System.Web.Security.Membership]::GeneratePassword(16, 5)
    
    # Afficher le mot de passe en clair (à noter dans un endroit sûr)
    Write-Host "Nouveau mot de passe généré: $newPassword"
    
    # Générer un hash (simplifié pour l'exemple)
    $hashedPassword = Get-BcryptHash -password $newPassword
    
    # Mettre à jour le mot de passe
    $user.password = $hashedPassword
    $user.updatedAt = [DateTime]::UtcNow.ToString("o")
    
    # Sauvegarder les modifications
    $usersData | ConvertTo-Json -Depth 10 | Set-Content -Path $usersPath -Encoding UTF8
    
    Write-Host "Le mot de passe de l'utilisateur vexx_owner a été mis à jour avec succès."
    Write-Host "N'oubliez pas de noter le mot de passe dans un endroit sûr !"
} else {
    Write-Error "L'utilisateur vexx_owner n'a pas été trouvé dans le fichier users.json"
}
