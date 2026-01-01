# Script pour générer un mot de passe sécurisé et le hacher

# Fonction pour générer un mot de passe sécurisé
function New-SecurePassword {
    param(
        [int]$Length = 16
    )
    
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-='.ToCharArray()
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] $Length
    $rng.GetBytes($bytes)
    $result = New-Object char[] $Length
    
    for ($i = 0; $i -lt $Length; $i++) {
        $result[$i] = $chars[[int]$bytes[$i] % $chars.Length]
    }
    
    return -join $result
}

# Chemin vers le fichier users.json
$usersPath = "d:\trading-formation\data\users.json"

# Lire le contenu actuel
$usersData = Get-Content -Path $usersPath -Raw | ConvertFrom-Json

# Générer un mot de passe sécurisé
$newPassword = New-SecurePassword -Length 16

# Afficher le mot de passe généré
Write-Host "Nouveau mot de passe généré : $newPassword"
Write-Host ""
Write-Host "Choisissez l'utilisateur à mettre à jour :"

# Afficher la liste des utilisateurs
for ($i = 0; $i -lt $usersData.users.Count; $i++) {
    Write-Host "$($i + 1). $($usersData.users[$i].username) ($($usersData.users[$i].email))"
}

# Demander à l'utilisateur de choisir
$choice = Read-Host "`nEntrez le numéro de l'utilisateur à mettre à jour (ou 'q' pour quitter)"

if ($choice -eq 'q') {
    exit
}

$index = [int]$choice - 1

if ($index -ge 0 -and $index -lt $usersData.users.Count) {
    $user = $usersData.users[$index]
    
    # Mettre à jour le mot de passe (dans un environnement réel, il faudrait utiliser bcrypt)
    $user.password = [System.Convert]::ToBase64String(
        [System.Security.Cryptography.SHA256]::Create().ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($newPassword)
        )
    )
    
    $user.updatedAt = [DateTime]::UtcNow.ToString("o")
    
    # Sauvegarder les modifications
    $usersData | ConvertTo-Json -Depth 10 | Set-Content -Path $usersPath -Encoding UTF8
    
    Write-Host "`nMot de passe mis à jour pour $($user.username) ($($user.email))"
    Write-Host "Nouveau mot de passe : $newPassword"
    Write-Host ""
    Write-Host "IMPORTANT : Notez ce mot de passe dans un endroit sûr !"
} else {
    Write-Host "Choix invalide. Veuillez réessayer."
}
