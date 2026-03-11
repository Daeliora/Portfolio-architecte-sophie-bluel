async function recupererTravaux() {
    const reponse = await fetch("http://localhost:5678/api/works");
    const travaux = await reponse.json();
    console.log(travaux); // Pour vérifier que tu reçois bien les données
    genererTravaux(travaux);
}

recupererTravaux();

function genererTravaux(travaux) {
    const divGallery = document.querySelector(".gallery");

    for (let i = 0; i < travaux.length; i++) {
        const projet = travaux[i];
        
        // Création des balises
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        image.src = projet.imageUrl;
        image.alt = projet.title;
        
        const figcaption = document.createElement("figcaption");
        figcaption.innerText = projet.title;

        // On rattache les balises au DOM
        divGallery.appendChild(figure);
        figure.appendChild(image);
        figure.appendChild(figcaption);
    }
}
