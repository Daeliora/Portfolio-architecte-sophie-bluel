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

    setupFormValidation();
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
        //deleteBtn.addEventListener("click", () => deleteWork(projet.id));
        deleteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
                supprimerProjet(projet.id, figure);
            }
        });

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

// --------------------- Preview d'une image à ajouter - Modale -------------------
// Fonction pour gérer l'aperçu de la photo sélectionnée
function setupImagePreview() {
    const fileInput = document.getElementById("file-upload");
    const previewImage = document.getElementById("image-preview");
    const container = document.querySelector(".upload-container");

    // => le déclencheur : change
    fileInput.addEventListener("change", () => {
        // => récupère le fichier : files[0]
        const file = fileInput.files[0];
        if (file) {
            // => le "lecteur" : new FileReader()
            const reader = new FileReader();
            // => la préparation : reader.onload
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.classList.remove("hidden");
                // On cache les éléments par défaut (icône, bouton, texte)
                // en ajoutant une classe "preview-active" au container
                container.classList.add("preview-mode");
            };
            // => l'ordre de lecture : readAsDataURL
            reader.readAsDataURL(file);
        }
    });
}

// Fonction pour remplir le menu déroulant des catégories, Remplir le <select> avec les catégories de l'API
async function displayCategoriesInSelect() {
    const select = document.getElementById("photo-category");
    const categories = await genererCategories(); // On utilise la fonction existante

    // On s'assure que le select est vide (sauf l'option vide par défaut)
    select.innerHTML = '<option value=""></option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.innerText = category.name;
        select.appendChild(option);
    });
}

// -----------pour dégrisser le bouton "valider" quand les critères requis sont mis----------
function checkFormValidity() {
    const fileInput = document.getElementById("file-upload");
    const titleInput = document.getElementById("photo-title");
    const categorySelect = document.getElementById("photo-category");
    const submitBtn = document.getElementById("btn-validate");

    // On vérifie si tout est rempli
    const isFileReady = fileInput.files.length > 0;
    const isTitleReady = titleInput.value.trim() !== "";
    const isCategoryReady = categorySelect.value !== "";

    if (isFileReady && isTitleReady && isCategoryReady) {
        submitBtn.disabled = false;
        submitBtn.classList.add("active"); // Devient vert via le CSS
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active"); // Reste gris
    }
}

 function setupFormValidation() {
        const fileInput = document.getElementById("file-upload");
        const titleInput = document.getElementById("photo-title");
        const categorySelect = document.getElementById("photo-category");

        // On surveille chaque champ
        fileInput.addEventListener("change", checkFormValidity);
        titleInput.addEventListener("input", checkFormValidity);
        categorySelect.addEventListener("change", checkFormValidity);

        // écoute évènement bouton pour ajout
        const form = document.getElementById("form-add-photo");
        form.addEventListener("submit", addProject);
    }

//--------------Envoyer un nouveau travail --------------
async function addProject(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const token = localStorage.getItem("token");
    const title = document.getElementById("photo-title").value;
    const category = document.getElementById("photo-category").value;
    const fileField = document.getElementById("file-upload").files[0];

    // On utilise FormData car on envoie un fichier (image)
    const formData = new FormData();
    formData.append("image", fileField);
    formData.append("title", title);
    formData.append("category", category);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            // vide le formulaire et l'aperçu
            document.getElementById("form-add-photo").reset();
            document.getElementById("image-preview").classList.add("hidden");
            document.querySelector(".upload-container i").style.display = "block";
            document.querySelector(".custom-file-upload").style.display = "block";
            
            // rafraîchit les galeries (principale + modale)
            document.querySelector(".gallery").innerHTML = "";
            document.querySelector(".modal-grid").innerHTML = "";
            await recupererTravaux(); // Cette fonction recharge tout
            displayModalGallery();

            // retour à la vue galerie de la modale
            document.getElementById("modal-add").style.display = "none";
            document.getElementById("modal-gallery").style.display = "block";
            
            alert("Projet ajouté avec succès !");
        } else {
            alert("Erreur lors de l'ajout du projet.");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

// ------------------------ Suppression de projets -----------------------------
async function supprimerProjet(id, figureElement) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.ok) {
        // --- MISE À JOUR DU DOM SANS RECHARGER ---
        // On retire l'élément de la modale
        figureElement.remove();
        
        // On rafraîchit la galerie principale pour que la photo disparaisse aussi là-bas
        document.querySelector(".gallery").innerHTML = "";
        recupererTravaux(); 
        
        console.log(`Le projet ${id} a été supprimé`);
    } else {
        alert("Erreur lors de la suppression du projet.");
    }
}


