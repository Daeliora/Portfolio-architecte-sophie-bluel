/** récupération api **/
async function loginUtilisateur(email, password) {
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            return await response.json(); // Retourne l'ID et le Token
        } else {
            alert("Erreur dans l’identifiant ou le mot de passe");
        }
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
    }
}

