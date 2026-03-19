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
            alert("Erreur dans l'identifiant ou le mot de passe");
        }
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
    }
}

/** gestion de l'évènement **/
const loginForm = document.querySelector("#login form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const data = await loginUtilisateur(email, password);
    
    // redirige vers index une fois connecté 
    if (data && data.token) {
        // Enregistre le token pour prouver qu'on est connecté
        localStorage.setItem("token", data.token);
        // Redirection vers la page d'accueil
        window.location.href = "index.html";
    }
});