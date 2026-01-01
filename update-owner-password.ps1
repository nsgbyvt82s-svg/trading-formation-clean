# Chemin du fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'

# Lire le contenu du fichier
$json = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Trouver l'utilisateur
$user = $json.users | Where-Object { $_.email -eq '1compris@diamondtrade.com' }

if ($user) {
    # Mettre à jour le mot de passe avec un nouveau hachage (pour le mot de passe: xP4$N8L!eQ0&)
    $user.password = '$2a$10$9jlqtfYtvcU9gmI3cbeUnup1kbJw39qf06PQjxFQ9QScOMjywP8ge'
    $user.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    # Sauvegarder les modifications
    $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force
    
    Write-Host "Mot de passe mis à jour avec succès pour 1compris@diamondtrade.com"
} else {
    Write-Host "Utilisateur non trouvé"
}
