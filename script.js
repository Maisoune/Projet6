document.addEventListener('DOMContentLoaded', function () {
    const url = 'http://localhost:5678/api/works';

    async function getTravaux() {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const data = await response.json();
            const gallery = document.getElementById('gallery');
            const modalGallery = document.getElementById('modal-gallery');

            gallery.innerHTML = '';
            modalGallery.innerHTML = '';

            data.forEach(travail => {
                const figureIndex = createFigureElement(travail, false);
                gallery.appendChild(figureIndex);

                const figureModal = createFigureElement(travail, true);
                modalGallery.appendChild(figureModal);
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    function createFigureElement(travail, withDeleteIcon) {
        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.src = travail.imageUrl;
        img.alt = travail.title;
        img.dataset.id = travail.id;

        figure.appendChild(img);

        if (withDeleteIcon) {
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fa-solid fa-trash-can delete-icon';
            deleteIcon.onclick = async function () {
                if (confirm("Voulez-vous supprimer cette image?")) {
                    try {
                        await deleteImage(travail.id);
                        figure.remove();
                    } catch (error) {
                        console.error('Erreur lors de la suppression de l\'image:', error);
                    }
                }
            };
            figure.appendChild(deleteIcon);
        }

        return figure;
    }

   async function deleteImage(id) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4';
    console.log('Token utilisé pour la requête:', token);
    try {
        console.log(`Suppression de l'image avec id ${id}`);
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Erreur lors de la suppression de l\'image:', errorMessage);
            throw new Error(errorMessage);
        }

        console.log(`Image avec id ${id} supprimée avec succès`);

        // Supprime l'élément du DOM dans la galerie de la page d'accueil
        document.querySelectorAll(`#gallery [data-id="${id}"]`).forEach(img => {
            img.parentElement.remove();
            console.log(`Image avec id ${id} supprimée de la galerie de la page d'accueil`);
        });

        // Supprime l'élément du DOM dans la modale
        document.querySelectorAll(`#modal-gallery [data-id="${id}"]`).forEach(img => {
            img.parentElement.remove();
            console.log(`Image avec id ${id} supprimée de la modale`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}


    async function addNewImage() {
        const input = document.getElementById('newImageInput');
        const title = document.getElementById('imageTitle').value;
        const category = document.getElementById('imageCategory').value;

        console.log('Image Title:', title);
        console.log('Image Category:', category);

        if (!input) {
            console.error('Element with ID "newImageInput" not found.');
            return;
        }

        if (!input.files || !input.files[0]) {
            console.error('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;
            const travail = {
                imageUrl: imageUrl,
                title: title,
                category: category,
                id: Date.now() // Utilisation d'un ID temporaire
            };

            console.log('Image URL:', imageUrl);

            // Ajouter l'image à la galerie de la modale pour la prévisualisation
            const previewContainer = document.querySelector('.search-file');
            previewContainer.innerHTML = `<img src="${imageUrl}" alt="Prévisualisation" style="max-width: 100%;">`;

            // Ajouter l'image à la galerie de la page d'accueil et à la modale
            const figure = createFigureElement(travail, true);
            document.getElementById('modal-gallery').appendChild(figure);

            const figureIndex = createFigureElement(travail, false);
            document.getElementById('gallery').appendChild(figureIndex);

            uploadImage(input.files[0], title, category);
        };
        reader.readAsDataURL(input.files[0]);
    }

    async function uploadImage(file, title, category) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('category', category);

        console.log('FormData:', formData);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement de l\'image');
            }

            const newImage = await response.json();
            console.log('Nouvelle Image:', newImage);
            // Mise à jour de l'ID temporaire avec l'ID réel retourné par l'API
            document.querySelector(`[data-id="${Date.now()}"]`).dataset.id = newImage.id;
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    async function fetchProjets() {
        try {
            const response = await fetch(url);
            const projets = await response.json();
            return projets;
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            return [];
        }
    }

    function genererMenuCategories(projets) {
        const categories = [...new Set(projets.map(projet => projet.category.name))];
        const menu = document.getElementById('menu-categories');

        function handleButtonClick(event, category) {
            document.querySelectorAll('#menu-categories button').forEach(button => {
                button.classList.remove('clicked');
            });

            event.target.classList.add('clicked');

            if (category === "Tous") {
                afficherTousProjets(projets);
            } else {
                filtrerProjets(projets, category);
            }
        }

        const buttonTous = document.createElement('button');
        buttonTous.textContent = "Tous";
        buttonTous.addEventListener('click', (event) => handleButtonClick(event, "Tous"));
        menu.appendChild(buttonTous);

        categories.forEach(categorie => {
            const button = document.createElement('button');
            button.textContent = categorie;
            button.addEventListener('click', (event) => handleButtonClick(event, categorie));
            menu.appendChild(button);
        });
    }

    function afficherTousProjets(projets) {
        const galerie = document.getElementById('gallery');
        galerie.innerHTML = '';
        projets.forEach(projet => {
            const div = document.createElement('div');
            div.className = 'projet';
            const img = document.createElement('img');
            img.src = projet.imageUrl;
            img.alt = projet.title;
            const titre = document.createElement('p');
            titre.textContent = projet.title;
            div.appendChild(img);
            div.appendChild(titre);
            galerie.appendChild(div);
        });
    }

    function filtrerProjets(projets, categorie) {
        const galerie = document.getElementById('gallery');
        galerie.innerHTML = '';
        const projetsFiltres = projets.filter(projet => projet.category.name === categorie);
        projetsFiltres.forEach(projet => {
            const div = document.createElement('div');
            div.className = 'projet';
            const img = document.createElement('img');
            img.src = projet.imageUrl;
            img.alt = projet.title;
            const titre = document.createElement('p');
            titre.textContent = projet.title;
            div.appendChild(img);
            div.appendChild(titre);
            galerie.appendChild(div);
        });
    }

    window.onload = async () => {
        const projets = await fetchProjets();
        if (projets.length > 0) {
            genererMenuCategories(projets);
            afficherTousProjets(projets);
        } else {
            console.error('Aucun projet trouvé.');
        }
    };

    // Gestion des modales
    document.getElementById('open-modal').addEventListener('click', function () {
        document.getElementById('modal').style.display = 'block';
        getTravaux();
    });

    document.querySelector('.close-button').addEventListener('click', function () {
        document.getElementById('modal').style.display = 'none';
    });

    document.querySelector('.close-add-photo-button').addEventListener('click', function () {
        document.getElementById('add-photo-modal').style.display = 'none';
    });

    window.onclick = function (event) {
        if (event.target == document.getElementById('modal')) {
            document.getElementById('modal').style.display = 'none';
        } else if (event.target == document.getElementById('add-photo-modal')) {
            document.getElementById('add-photo-modal').style.display = 'none';
        }
    };

    document.getElementById('addImageButton').addEventListener('click', function () {
        document.getElementById('add-photo-modal').style.display = 'block';
        document.getElementById('modal').style.display = 'none';
    });

    document.getElementById('validateAddImageButton').addEventListener('click', function () {
        addNewImage();
    });

    // Prévisualisation de l'image sélectionnée
    document.getElementById('newImageInput').addEventListener('change', function (event) {
        const input = event.target;
        const previewContainer = document.querySelector('.search-file');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                previewContainer.innerHTML = `<img src="${imageUrl}" alt="Prévisualisation" style="max-width: 100%;">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    });

    window.addEventListener('load', function () {
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        if (isAuthenticated === 'true') {
            document.getElementById('edition').style.display = 'flex';
            document.getElementById('open-modal').style.display = 'block';
            document.getElementById('menu-categories').style.display = 'none';
        } else {
            document.getElementById('edition').style.display = 'none';
            document.getElementById('open-modal').style.display = 'none';
            document.getElementById('menu-categories').style.display = 'block';
        }
    });

    // Appel initial à getTravaux()
    getTravaux();

});
