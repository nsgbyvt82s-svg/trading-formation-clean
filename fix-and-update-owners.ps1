# Chemin du fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'

# Lire le contenu actuel
$content = Get-Content -Path $jsonPath -Raw

# Nettoyer le contenu
$content = $content.Trim()

# Convertir en objet PowerShell
$json = $content | ConvertFrom-Json

# Mettre à jour les propriétaires
$ownerEmails = @('1compris@diamondtrade.com', 'vexx@diamondtrade.com')
$updated = $false

foreach ($user in $json.users) {
    if ($ownerEmails -contains $user.email -and $user.role -ne 'OWNER') {
        $user.role = 'OWNER'
        $user.updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        Write-Host "Mise à jour du rôle pour $($user.email) en OWNER"
        $updated = $true
    }
}

if ($updated) {
    # Sauvegarder les modifications
    $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force
    Write-Host "Mise à jour des propriétaires terminée" -ForegroundColor Green
} else {
    Write-Host "Aucune mise à jour nécessaire" -ForegroundColor Yellow
}
