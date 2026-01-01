# Lire le fichier users.json
$jsonPath = 'd:\trading-formation\data\users.json'
$json = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Date actuelle au format ISO 8601
$date = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

# Créer les objets utilisateur pour les propriétaires
$owner1 = [PSCustomObject]@{
    id = 'owner_1'
    email = '1compris@diamondtrade.com'
    password = '$2a$10$9jlqtfYtvcU9gmI3cbeUnup1kbJw39qf06PQjxFQ9QScOMjywP8ge'  # xP4$N8L!eQ0&
    name = 'Owner 1'
    username = 'owner1'
    role = 'OWNER'
    status = 'ACTIVE'
    emailVerified = $date
    createdAt = $date
    updatedAt = $date
}

$owner2 = [PSCustomObject]@{
    id = 'owner_2'
    email = 'vexx@diamondtrade.com'
    password = '$2a$10$9jlqtfYtvcU9gmI3cbeUnup1kbJw39qf06PQjxFQ9QScOMjywP8ge'  # A9!qR7m@ZK2#
    name = 'Vexx Owner'
    username = 'vexx_owner'
    role = 'OWNER'
    status = 'ACTIVE'
    emailVerified = $date
    createdAt = $date
    updatedAt = $date
}

# Ajouter les propriétaires au tableau des utilisateurs
$json.users += $owner1
$json.users += $owner2

# Écrire le fichier mis à jour
$json | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding utf8 -NoNewline -Force

Write-Host "Les comptes propriétaires ont été ajoutés avec succès !"
