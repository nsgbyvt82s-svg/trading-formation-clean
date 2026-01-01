# Chemin vers le fichier users.json
$usersFilePath = Join-Path -Path $PSScriptRoot -ChildPath "..\data\users.json"

# Vérifier si le fichier existe
if (-not (Test-Path -Path $usersFilePath)) {
    Write-Error "Le fichier users.json n'existe pas à l'emplacement : $usersFilePath"
    exit 1
}

# Lire le contenu actuel du fichier
$jsonContent = Get-Content -Path $usersFilePath -Raw | ConvertFrom-Json

# Vérifier si l'utilisateur existe déjà
$userExists = $jsonContent.users | Where-Object { $_.email -eq 't.monseur@hotmail.com' }

if ($userExists) {
    Write-Host "Un utilisateur avec l'email t.monseur@hotmail.com existe déjà."
    exit 0
}

# Créer un nouvel utilisateur avec un mot de passe haché (à remplacer par un hachage bcrypt généré)
$newUser = @{
    id = "user_$(Get-Date -Format 'yyyyMMddHHmmss')"
    email = 't.monseur@hotmail.com'
    password = '$2a$10$9jlqtfYtvcU9gmI3cbeUnuplkbJw39qf06PQjxFQ9QScOMjywP8ge'  # Motdepasse123!
    name = 'Utilisateur Test'
    username = 'utilisateur_test'
    role = 'USER'
    status = 'ACTIVE'
    emailVerified = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    updatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Ajouter le nouvel utilisateur
$jsonContent.users += $newUser

# Sauvegarder les modifications
$jsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $usersFilePath -Encoding UTF8

Write-Host "L'utilisateur a été ajouté avec succès !"
Write-Host "Email: t.monseur@hotmail.com"
Write-Host "Mot de passe: Motdepasse123!"
