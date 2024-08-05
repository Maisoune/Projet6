// Formulaire de connexion
document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form submitted with email:', email, 'and password:', password);

    if (email === 'admin@example.com' && password === 'adminpassword') {
        console.log('Admin credentials matched. Redirecting to admin dashboard');

        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'index.html';
    } else {
        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.token) {
                console.log('Login successful. Redirecting to user dashboard');

                localStorage.setItem('token', data.token);
                localStorage.setItem('isAuthenticated', 'true');  // Store authentication status
                window.location.href = 'index.html';
            } else {
                alert('Erreur de connexion: ' + (data.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion: ' + error.message);
        }
    }

});

// Vérification de l'authentification au chargement de la page
/*document.addEventListener('DOMContentLoaded', function () {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        window.location.href = 'connexion.html';  // Redirige vers la page de connexion si non authentifié
    }
});

// Déconnexion automatique lors de la fermeture ou du rechargement de la page
window.addEventListener('beforeunload', function () {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    console.log('Utilisateur déconnecté automatiquement');
});*/



// Gestion du clic sur le lien "Mot de passe oublié"
document.getElementById('forgot-password').addEventListener('click', function (event) {
    event.preventDefault();
    alert('Lien de récupération de mot de passe cliqué');
});



