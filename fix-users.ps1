$jsonContent = @'
{
  "users": [
    {
      "id": "client_12345",
      "email": "client@example.com",
      "password": "$2a$10$9jlqtfYtvcU9gmI3cbeUnuplkbJw39qf06PQjxFQ9QScOMjywP8ge",
      "name": "Client Test",
      "username": "client",
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "sessions": []
}
'@

$filePath = "d:\trading-formation\data\users.json"

# Créer le répertoire s'il n'existe pas
$directory = [System.IO.Path]::GetDirectoryName($filePath)
if (-not (Test-Path -Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

# Écrire le contenu dans le fichier
[System.IO.File]::WriteAllText($filePath, $jsonContent, [System.Text.Encoding]::UTF8)

Write-Host "Le fichier users.json a été créé avec succès à l'emplacement : $filePath"
