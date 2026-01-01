# Chemin du fichier users.json
$usersFile = "d:\trading-formation\data\users.json"

# Lire le contenu du fichier
$jsonContent = Get-Content -Path $usersFile -Raw

# Nettoyer le contenu (supprimer le BOM si présent)
$jsonContent = $jsonContent.Trim() -replace '^\uFEFF', ''

# Convertir en objet PowerShell
$data = $jsonContent | ConvertFrom-Json

# Trouver l'utilisateur owner_1
$owner = $data.users | Where-Object { $_.id -eq 'owner_1' } | Select-Object -First 1

if ($null -ne $owner) {
    # Afficher l'ancien mot de passe
    Write-Host "Ancien mot de passe: $($owner.password)"
    
    # Définir le nouveau mot de passe (le même que celui utilisé précédemment)
    $newPassword = 'xP4$N8L!eQ0&'
    
    # Générer un nouveau sel et hacher le mot de passe
    $salt = [BCrypt.Net.BCrypt]::GenerateSalt(10)
    $hashedPassword = [BCrypt.Net.BCrypt]::HashPassword($newPassword, $salt)
    
    # Mettre à jour le mot de passe
    $owner.password = $hashedPassword
    $owner.updatedAt = [System.DateTime]::UtcNow.ToString("o")
    
    # Convertir en JSON et sauvegarder
    $updatedJson = $data | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($usersFile, $updatedJson, [System.Text.Encoding]::UTF8)
    
    Write-Host "Mot de passe mis à jour avec succès pour $($owner.email)" -ForegroundColor Green
    Write-Host "Nouveau hachage: $hashedPassword" -ForegroundColor Green
} else {
    Write-Host "Utilisateur owner_1 non trouvé" -ForegroundColor Red
}
