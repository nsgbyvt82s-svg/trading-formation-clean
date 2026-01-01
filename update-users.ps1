$usersJson = @{
    users = @(
        @{
            id = "owner_1"
            email = "1compris@diamondtrade.com"
            password = "$2a$10$9jlqtfYtvcU9gmI3cbeUnup1kbJw39qf06PQjxFQ9QScOMjywP8ge"
            name = "Owner 1"
            username = "owner1"
            role = "OWNER"
            status = "ACTIVE"
            emailVerified = "2026-01-01T00:00:00.000Z"
            createdAt = "2026-01-01T00:00:00.000Z"
            updatedAt = "2026-01-01T00:00:00.000Z"
        },
        @{
            id = "owner_2"
            email = "vexx@diamondtrade.com"
            password = "$2a$10$FZaerSu3vMlicYSTPZGtZOt1F3C3Zxes1.EYsH5D7Jmk2ZKjykVi"
            name = "Vexx Owner"
            username = "vexx_owner"
            role = "OWNER"
            status = "ACTIVE"
            emailVerified = "2026-01-01T00:00:00.000Z"
            createdAt = "2026-01-01T00:00:00.000Z"
            updatedAt = "2026-01-01T00:00:00.000Z"
        },
        @{
            id = "admin_1"
            email = "admin@example.com"
            password = "$2a$10$O5CP0STzFDvCbzWmPyp9DubMx9.hXBaQmfRbqhj3Zl49Ijq94506G"
            name = "Admin"
            username = "admin"
            role = "ADMIN"
            status = "ACTIVE"
            emailVerified = "2026-01-01T00:00:00.000Z"
            createdAt = "2026-01-01T00:00:00.000Z"
            updatedAt = "2026-01-01T00:00:00.000Z"
        }
    )
    sessions = @()
}

# Convertir en JSON et sauvegarder
$json = $usersJson | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("d:\trading-formation\data\users.json", $json, [System.Text.Encoding]::UTF8)

Write-Host "Fichier users.json mis à jour avec succès !" -ForegroundColor Green
