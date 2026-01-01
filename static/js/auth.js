// Gestion de la soumission du formulaire d'inscription
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Désactive le bouton pour éviter les soumissions multiples
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Inscription en cours...';
            
            // Soumet le formulaire de manière asynchrone
            fetch(registerForm.action, {
                method: 'POST',
                body: new URLSearchParams(new FormData(registerForm)),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    return response.text().then(html => {
                        // Si on arrive ici, il y a eu une erreur
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const errorMessage = doc.querySelector('.alert-error');
                        
                        if (errorMessage) {
                            alert(errorMessage.textContent);
                        } else {
                            alert('Une erreur est survenue lors de l\'inscription');
                        }
                        
                        submitButton.disabled = false;
                        submitButton.textContent = 'S\'inscrire';
                    });
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur de connexion au serveur');
                submitButton.disabled = false;
                submitButton.textContent = 'S\'inscrire';
            });
        });
    }
});
