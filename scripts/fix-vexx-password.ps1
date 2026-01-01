# Script pour mettre à jour le mot de passe de vexx_owner avec un mot de passe plus simple

# Chemin vers le fichier users.json
$usersPath = "d:\trading-formation\data\users.json"

# Lire le contenu actuel
$usersData = Get-Content -Path $usersPath -Raw | ConvertFrom-Json

# Trouver l'utilisateur vexx_owner
$user = $usersData.users | Where-Object { $_.username -eq 'vexx_owner' }

if ($user) {
    # Créer un mot de passe plus simple (12 caractères, lettres majuscules/minuscules et chiffres)
    $newPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 12 | ForEach-Object {[char]$_})
    
    # Afficher le nouveau mot de passe
    Write-Host "Nouveau mot de passe généré pour vexx_owner: $newPassword"
    
    # Mettre à jour le mot de passe (dans un vrai environnement, il faudrait le hacher avec bcrypt)
    # Pour l'instant, on utilise un hachage simple pour débloquer la situation
    $user.password = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($newPassword))
    $user.updatedAt = [DateTime]::UtcNow.ToString("o")
    
    # Sauvegarder les modifications
    $usersData | ConvertTo-Json -Depth 10 | Set-Content -Path $usersPath -Encoding UTF8
    
    Write-Host "Le mot de passe de l'utilisateur vexx_owner a été mis à jour avec succès."
    Write-Host "Utilisez le mot de passe ci-dessus pour vous connecter."
} else {
    Write-Error "L'utilisateur vexx_owner n'a pas été trouvé dans le fichier users.json"
}
