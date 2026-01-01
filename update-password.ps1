# Lire le fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'
$json = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Trouver l'utilisateur
$user = $json.users | Where-Object { $_.email -eq 'vexx@diamondtrade.com' }

if ($user) {
    # Mettre à jour le mot de passe avec le nouveau hachage
    $user.password = '$2a$10$FZaerSu3vMlicYSTPZGtZOt1F3C3Zxes1.EYsH5D7Jmk2ZKjykVi'
    
    # Mettre à jour la date de modification
    $user.updatedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    
    # Écrire le fichier mis à jour
    $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force
    
    Write-Host "Mot de passe mis à jour avec succès pour vexx@diamondtrade.com"
} else {
    Write-Host "Utilisateur non trouvé"
}
