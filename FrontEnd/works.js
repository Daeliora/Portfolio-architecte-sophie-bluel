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
};

// fonction dédiée UNIQUEMENT à l'appel API (Réutilisable)
async function genererCategories() {
    const reponse = await fetch("http://localhost:5678/api/categories");
    return await reponse.json();
};

// fonction d'initialisation qui orchestre le tout
async function init() {
    const categories = await genererCategories();
    genererFiltres(categories);

    displayAdminMode();
    setupModal();
    setupModalNavigation();

    setupImagePreview();
    displayCategoriesInSelect();
};

// lance l'application
init();

//-----------------------gestion mode éditeur ----------------------------

function checkAuthentication() {
    const token = localStorage.getItem("token");
    const loginLink = document.querySelector("#login-link"); // Ajoute un ID au <a> login dans le HTML
    const filters = document.querySelector(".filters");

    if (token) {
        // Change "login" en "logout"
        loginLink.innerText = "logout";
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });

        // Masque les filtres (comme demandé dans la maquette en mode édition)
        if (filters) filters.style.display = "none";

        // Affiche les éléments d'édition (la barre noire, les boutons modifier)
        displayAdminMode();
    };
};

function displayAdminMode() {
    const token = localStorage.getItem("token");
    const adminElements = document.querySelectorAll(".admin-only");
    const loginLink = document.getElementById("login-link");
    const filters = document.querySelector(".filters");

    if (token) {
        // 1. Affiche tous les éléments réservés à l'admin
        adminElements.forEach(el => el.classList.remove("hidden"));     // ??????????????

        // 2. Cache les filtres (la maquette montre qu'ils disparaissent en mode édition)
        if (filters) filters.style.display = "none";    

        // 3. Transforme "login" en "logout"
        if (loginLink) {
            loginLink.innerText = "logout";
            loginLink.href = "#"; 
            loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }
        
        // Ajustement du header pour laisser de la place à la barre noire
        document.querySelector("header").style.marginTop = "100px";
    }
}

// Pour se logout du mode édition
function logout() {
    localStorage.removeItem("token"); // supprime la clé
    window.location.reload(); // recharge pour redevenir "public"
};


// --------------------------------- Filtres ---------------------------

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


//------------------------------------------- Modale ------------------------------------

function openModal() {
    const modal = document.getElementById("modal");
    const openModalBtn = document.getElementById("open-modal");

    if (openModalBtn) {
        openModalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.style.display = "flex";
            displayModalGallery(); // appel pour afficherer les photos ici
        });
    }

    // Fermeture sur la croix ou à côté de la modale
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
    
    document.querySelector(".js-modal-close").addEventListener("click", () => {
        modal.style.display = "none";
    });
}


// fonction pour afficher la galerie dans la modale 
async function displayModalGallery() {
    const modalGrid = document.querySelector(".modal-grid");
    modalGrid.innerHTML = ""; // On vide la grille avant d'afficher

    // récupère les travaux via API
    const response = await fetch("http://localhost:5678/api/works");
    const travaux = await response.json();

    travaux.forEach(projet => {
        const figure = document.createElement("figure");
        figure.setAttribute("data-id", projet.id);

        const img = document.createElement("img");
        img.src = projet.imageUrl;
        img.alt = projet.title;

        // création du bouton poubelle
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-icon");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        
        // attache l'événement de suppression 
        deleteBtn.addEventListener("click", () => deleteWork(projet.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGrid.appendChild(figure);
    });
}

// fonction pour ouvrir la modale 
function setupModal() {
    const modal = document.getElementById("modal");
    const openModalBtn = document.getElementById("open-modal");
    const closeModalBtn = document.querySelector(".js-modal-close");

    if (openModalBtn) {
        openModalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.style.display = "flex";
            displayModalGallery(); // On charge la galerie à l'ouverture
        });
    }

    // Fermeture
    closeModalBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
}

//------------------------------Ajout photo - Modale ------------------------
//fonction de navigation dans la modale
function setupModalNavigation() {
    const btnAddPhoto = document.getElementById("btn-add-photo");
    const btnBack = document.querySelector(".js-modal-back");
    const viewGallery = document.getElementById("modal-gallery");
    const viewAdd = document.getElementById("modal-add");
    const closeModalBtn = document.querySelector(".js-modal-add-close");

    // Aller vers l'ajout
    btnAddPhoto.addEventListener("click", () => {
        viewGallery.style.display = "none";
        viewAdd.style.display = "block";
    });

    // Revenir à la galerie
    btnBack.addEventListener("click", () => {
        viewAdd.style.display = "none";
        viewGallery.style.display = "block";
    });

    // Fermeture
    closeModalBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
}


// Fonction pour gérer l'aperçu de la photo sélectionnée
function setupImagePreview() {
    const fileInput = document.getElementById("file-upload");
    const previewImage = document.getElementById("image-preview");
    const container = document.querySelector(".upload-container");

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.classList.remove("hidden");
                // On cache les éléments par défaut (icône, bouton, texte)
                // en ajoutant une classe "preview-active" au container
                container.classList.add("preview-mode");
            };
            reader.readAsDataURL(file);
        }
    });
}

// Fonction pour remplir le menu déroulant des catégories
async function displayCategoriesInSelect() {
    const select = document.getElementById("photo-category");
    const categories = await genererCategories(); // On utilise ta fonction existante

    // On s'assure que le select est vide (sauf l'option vide par défaut)
    select.innerHTML = '<option value=""></option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.innerText = category.name;
        select.appendChild(option);
    });
}