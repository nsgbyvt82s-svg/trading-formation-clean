# Chemin du fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'

try {
    # Lire le contenu actuel
    $content = Get-Content -Path $jsonPath -Raw
    
    # Nettoyer les espaces en trop
    $content = $content.Trim()
    
    # Convertir en objet et revenir à du JSON bien formaté
    $json = $content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force
    
    Write-Host "Le fichier users.json a été correctement formaté" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du formatage du fichier: $_" -ForegroundColor Red
}
