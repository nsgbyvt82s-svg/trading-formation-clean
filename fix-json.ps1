$jsonPath = 'd:\trading-formation\data\users.json'

# Lire le contenu actuel du fichier
$content = Get-Content -Path $jsonPath -Raw

# Nettoyer le contenu (supprimer les espaces en trop, etc.)
$content = $content.Trim()

# Convertir en objet et revenir à du JSON bien formaté
$json = $content | ConvertFrom-Json
$json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force

Write-Host "Le fichier users.json a été nettoyé avec succès"
