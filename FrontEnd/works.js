async function recupererTravaux() {
    const reponse = await fetch("http://localhost:5678/api/works");
    const travaux = await reponse.json();
    console.log(travaux); // Pour vérifier qu'on reçoit bien les données
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

// 1. Une fonction dédiée UNIQUEMENT à l'appel API (Réutilisable)
async function genererCategories() {
    const reponse = await fetch("http://localhost:5678/api/categories");
    return await reponse.json();
}

// 2. Une fonction d'initialisation qui orchestre le tout
async function init() {
    const categories = await genererCategories();
    genererFiltres(categories);
}

// On lance l'application
init();


// ------------- Filtres ---------------------------

function genererFiltres(categories) {
    const divFilters = document.querySelector(".filters"); // div dans HTML

    // Création du bouton "Tous"
    const boutonTous = document.createElement("button");
    boutonTous.innerText = "Tous";
    boutonTous.classList.add("btn-filter", "active"); // Ajout classes CSS
    divFilters.appendChild(boutonTous);

    boutonTous.addEventListener("click", () => {
        document.querySelector(".gallery").innerHTML = ""; // vide la galerie
        recupererTravaux(); // On recharge tout
    });
   
    
    // Création des boutons par catégorie
    categories.forEach(categorie => {
        const bouton = document.createElement("button");
        bouton.innerText = categorie.name;
        bouton.classList.add("btn-filter");
       

        bouton.addEventListener("click", () => {
            filtrerTravaux(categorie.id);
        
        });
         divFilters.appendChild(bouton);
    });
}

async function filtrerTravaux(idCategorie) {
    const reponse = await fetch("http://localhost:5678/api/works");
    const travaux = await reponse.json();
    
    // filtre la liste
    const travauxFiltres = travaux.filter(travail => travail.categoryId === idCategorie);

    // vide la galerie et on réaffiche seulement les bons
    document.querySelector(".gallery").innerHTML = "";
    genererTravaux(travauxFiltres);
}

