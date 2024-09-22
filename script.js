document.addEventListener("DOMContentLoaded", async function () {
  const url = "http://localhost:5678/api/works";
  let travaux = window.localStorage.getItem("travaux");

  if (true) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      travaux = await response.json();
      window.localStorage.setItem("travaux", JSON.stringify(travaux));
    } catch (error) {
      console.error("Erreur:", error);
      travaux = [];
    }
  } else {
    travaux = JSON.parse(travaux);
  }

  function afficherGallery(travaux) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    travaux.forEach((travail) => {
      const figureIndex = createFigureElement(travail, false, true);
      gallery.appendChild(figureIndex);
    });
  }

  function afficherModalGallery(travaux) {
    const modalGallery = document.getElementById("modal-gallery");
    modalGallery.innerHTML = "";

    travaux.forEach((travail) => {
      const figureModal = createFigureElement(travail, true, false);
      modalGallery.appendChild(figureModal);
    });
  }

  function createFigureElement(travail, withDeleteIcon, showTitle) {
    const figure = document.createElement("figure");
    figure.id = "projet";

    const img = document.createElement("img");
    img.src = travail.imageUrl;
    img.alt = travail.title;
    img.id = "test";

    figure.appendChild(img);

    if (showTitle) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = travail.title;
      figure.appendChild(figcaption);
    }

    if (withDeleteIcon) {
      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fa-solid fa-trash-can delete-icon";
      deleteIcon.onclick = async function () {
        if (confirm("Voulez-vous supprimer cette image?")) {
          try {
            await deleteImage(travail.id);
            figure.remove();
            travaux = travaux.filter((t) => t.id !== travail.id);
            window.localStorage.setItem("travaux", JSON.stringify(travaux));
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
          }
        }
      };
      figure.appendChild(deleteIcon);
    }

    return figure;
  }

  async function deleteImage(id) {
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(
          "Erreur lors de la suppression de l'image:",
          errorMessage
        );
        throw new Error(errorMessage);
      }

      // Suppression des images correspondantes dans la galerie principale et la galerie modale
      const imageToDelete = document.getElementById(id);
      console.log(imageToDelete);

      imageToDelete.remove();

      // Mettre à jour les données dans localStorage
      let travaux = JSON.parse(window.localStorage.getItem("travaux"));
      travaux = travaux.filter((t) => t.id !== id);
      window.localStorage.setItem("travaux", JSON.stringify(travaux));
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  document
    .getElementById("newImageInput")
    .addEventListener("change", function (event) {
      const input = event.target;

      console.log(input);

      // Vérifiez si un fichier a été sélectionné
      if (true) {
        const reader = new FileReader();

        // Lorsque l'image est lue, nous remplaçons le contenu de .search-file par la prévisualisation de l'image
        reader.onload = function (e) {
          const previewImage = document.createElement("img");
          previewImage.src = e.target.result;
          previewImage.alt = "Prévisualisation de l'image";
          previewImage.style.maxWidth = "50%";
          previewImage.style.height = "50%"; // Style pour centrer l'image

          previewImage.style.marginLeft = "auto";
          previewImage.style.marginRight = "auto";

          // Supprimez le contenu actuel de .search-file et remplacez-le par l'image prévisualisée

          const searchFileElement = document.querySelector(".search-file");
          console.log(searchFileElement);
          searchFileElement.style.textAlign = "center";
          searchFileElement.innerHTML = ""; // Vider le contenu actuel
          searchFileElement.appendChild(previewImage); // Ajouter l'image prévisualisée
        };

        // Lire l'image sous forme d'URL
        reader.readAsDataURL(input.files[0]);
      }
    });

  document
    .getElementById("validateAddImageButton")
    .addEventListener("click", async function () {
      const title = document.getElementById("imageTitle").value;
      const category = document.getElementById("imageCategory").value;
      const input = document.getElementById("newImageInput");
      console.log(input);

      if (input !== null && (!input.files || !input.files[0])) {
        console.error("Aucun fichier sélectionné.");
        return;
      }

      if (input !== null) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", 1);

        const token = localStorage.getItem("token");
        console.log(token);
        console.log(formData);
        try {
          const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            body: formData,
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error("Erreur lors du téléchargement de l'image");
          }

          const travaux =
            JSON.parse(window.localStorage.getItem("travaux")) || [];

          const imageUrl = result.imageUrl;

          const newTravail = {
            id: result.id,
            title: result.title,
            category: result.categoryId,
            imageUrl: imageUrl,
          };

          travaux.push(newTravail);
          window.localStorage.setItem("travaux", JSON.stringify(travaux));

          // Ajouter à la galerie principale
          const figureIndex = createFigureElement(newTravail, false, true);
          document.getElementById("gallery").appendChild(figureIndex);

          // Ajouter à la galerie modale
          const figureModal = createFigureElement(newTravail, true, false);
          document.getElementById("modal-gallery").appendChild(figureModal);

          // Réinitialiser le menu de catégories et réafficher les projets
          genererMenuCategories(travaux);
          afficherTousProjets(travaux);

          // Réinitialiser le formulaire
          document.getElementById("imageTitle").value = "";
          document.getElementById("imageCategory").value = "";

          // Ferme la modal
          document.getElementById("add-photo-modal").style.display = "none";
        } catch (error) {
          console.error("Erreur:", error);
        }
      }
    });

  // Fermeture automatique de la modal après la validation
  document
    .getElementById("validateAddImageButton")
    .addEventListener("click", function () {
      document.getElementById("add-photo-modal").style.display = "none";
    });

  // Fonction pour générer dynamiquement le menu de catégories
  function genererMenuCategories(projets) {
    const categories = [
      ...new Set(
        projets.map((projet) => projet.category.name).filter((name) => name)
      ),
    ];
    const menu = document.getElementById("menu-categories"); // Supprimer le contenu existant du menu avant d'ajouter les nouveaux boutons

    menu.innerHTML = "";

    // Fonction pour retirer la classe 'clicked' de tous les boutons
    function retirerClasseClicked() {
      const buttons = menu.querySelectorAll("button");
      buttons.forEach((button) => {
        button.classList.remove("clicked");
      });
    } // Bouton pour afficher tous les projets

    const buttonTous = document.createElement("button");
    buttonTous.textContent = "Tous";
    buttonTous.addEventListener("click", () => {
      retirerClasseClicked();
      buttonTous.classList.add("clicked");
      afficherTousProjets(projets);
    });
    menu.appendChild(buttonTous);

    categories.forEach((categorie) => {
      const button = document.createElement("button");
      button.textContent = categorie;
      button.addEventListener("click", () => {
        retirerClasseClicked();
        button.classList.add("clicked");
        filtrerProjets(projets, categorie);
      });
      menu.appendChild(button);
    }); // Ajouter la classe 'clicked' au bouton "Tous" par défaut

    buttonTous.classList.add("clicked");
  } // Fonction pour afficher tous les projets

  function afficherTousProjets(projets) {
    const galerie = document.getElementById("gallery");
    galerie.innerHTML = "";

    // Efface le contenu actuel de la galerie
    projets.forEach((projet) => {
      const div = document.createElement("div");
      console.log(projet);
      div.className = "projet";
      div.id = projet.id;

      const img = document.createElement("img");
      img.src = projet.imageUrl;
      img.alt = projet.title;

      const titre = document.createElement("p");
      titre.textContent = projet.title;
      div.appendChild(img);
      div.appendChild(titre);
      galerie.appendChild(div);
    });
  } // Fonction pour filtrer les projets par catégorie

  function filtrerProjets(projets, categorie) {
    const galerie = document.getElementById("gallery");
    galerie.innerHTML = ""; // Efface le contenu actuel de la galerie
    const projetsFiltres = projets.filter(
      (projet) => projet.category.name === categorie
    );
    projetsFiltres.forEach((projet) => {
      const div = document.createElement("div");
      div.className = "projet";
      const img = document.createElement("img");
      img.src = projet.imageUrl;
      img.alt = projet.title;
      const titre = document.createElement("p");
      titre.textContent = projet.title;
      div.appendChild(img);
      div.appendChild(titre);
      galerie.appendChild(div);
    });
  } // Appel des fonctions pour afficher les galeries et le menu de catégories

  afficherGallery(travaux);
  afficherModalGallery(travaux);
  genererMenuCategories(travaux);
  afficherTousProjets(travaux);

  document
    .getElementById("validateAddImageButton")
    .addEventListener("click", async function () {
      const title = document.getElementById("imageTitle").value;
      const category = document.getElementById("imageCategory").value;
      const input = document.getElementById("newImageInput");

      if (!input.files || !input.files[0]) {
        console.error("Aucun fichier sélectionné.");
        return;
      }

      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const imageUrl = e.target.result;
        const travaux =
          JSON.parse(window.localStorage.getItem("travaux")) || [];

        const newTravail = {
          id: Date.now(),
          title: title,
          category: { name: category },
          imageUrl: imageUrl,
        };

        travaux.push(newTravail);
        window.localStorage.setItem("travaux", JSON.stringify(travaux));

        const figureIndex = createFigureElement(newTravail, false, true);
        document.getElementById("gallery").appendChild(figureIndex);

        const figureModal = createFigureElement(newTravail, true, false);
        document.getElementById("modal-gallery").appendChild(figureModal);

        // Réinitialiser le menu de catégories et réafficher les projets
        genererMenuCategories(travaux);
        afficherTousProjets(travaux);

        document.getElementById("imageTitle").value = "";
        document.getElementById("imageCategory").value = "";
        document.getElementById("newImageInput").value = "";
        document.querySelector(".search-file").innerHTML =
          '<i class="fa-regular fa-image"></i><label for="newImageInput" class="custom-file-upload">+ Ajouter une photo</label><span>jpg, png : 4mo max</span>';

        document.getElementById("add-photo-modal").style.display = "none";
      };

      reader.readAsDataURL(file);
    });

  // Ouverture et fermeture des modales

  document.getElementById("open-modal").addEventListener("click", function () {
    document.getElementById("modal").style.display = "block";
  });

  document
    .querySelector(".close-button")
    .addEventListener("click", function () {
      document.getElementById("modal").style.display = "none";
    });

  document
    .querySelector(".close-add-photo-button")
    .addEventListener("click", function () {
      document.getElementById("add-photo-modal").style.display = "none";
    });

  window.onclick = function (event) {
    if (event.target == document.getElementById("modal")) {
      document.getElementById("modal").style.display = "none";
    } else if (event.target == document.getElementById("add-photo-modal")) {
      document.getElementById("add-photo-modal").style.display = "none";
    }
  };

  document
    .getElementById("addImageButton")
    .addEventListener("click", function () {
      document.getElementById("add-photo-modal").style.display = "block";
      document.getElementById("modal").style.display = "none";
    });
});

// Fonction pour mettre à jour le texte du lien en fonction de l'état d'authentification
function updateLoginLink() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (isAuthenticated) {
    // L'utilisateur est connecté
    document.getElementById("login-link").innerHTML = '<a href="#">logout</a>'; // Afficher les éléments
    document.getElementById("edition").style.display = "block";
    document.getElementById("open-modal").style.display = "block"; // Cacher la partie menu-categories

    document.getElementById("menu-categories").style.display = "none";
  } else {
    // L'utilisateur n'est pas connecté
    document.getElementById("login-link").innerHTML =
      '<a href="connexion.html">login</a>'; // Cacher les éléments

    document.getElementById("edition").style.display = "none";
    document.getElementById("open-modal").style.display = "none"; // Afficher la partie menu-categories

    document.getElementById("menu-categories").style.display = "block";
  }
}

// Gestion du clic sur le lien "login"
document
  .getElementById("login-link")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated) {
      // Déconnexion de l'utilisateur
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      console.log("Utilisateur déconnecté"); // Mettre à jour le texte du lien

      updateLoginLink(); // Redirection vers la page d'accueil

      window.location.href = "index.html";
    } else {
      // Redirection vers la page de connexion
      window.location.href = "connexion.html";
    }
  });

// Appel à la fonction pour mettre à jour le texte du lien lors du chargement de la page
updateLoginLink();
