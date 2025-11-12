// Configuration de l'API
const API_URL = 'http://localhost:8000';

// État de l'application
let currentEditId = null;

// Éléments du DOM
const productForm = document.getElementById('product-form');
const productsContainer = document.getElementById('products-container');
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Configuration des événements
function setupEventListeners() {
    productForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    refreshBtn.addEventListener('click', loadProducts);
}

// Charger tous les produits
async function loadProducts() {
    try {
        showLoading(true);
        hideError();

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const products = await response.json();
        displayProducts(products);

    } catch (error) {
        showError('Impossible de charger les produits. Vérifiez que l\'API est démarrée.');
        console.error('Erreur:', error);
    } finally {
        showLoading(false);
    }
}

// Afficher les produits
function displayProducts(products) {
    if (!products || products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Aucun produit</h3>
                <p>Commencez par ajouter votre premier produit !</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <div class="product-info">
                <span class="product-price">${product.price.toFixed(2)} €</span>
                <span class="product-stock ${product.stock < 10 ? 'low-stock' : ''}">
                    Stock: ${product.stock}
                </span>
            </div>
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">
                    Modifier
                </button>
                <button class="btn btn-delete" onclick="deleteProduct(${product.id})">
                    Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

// Gérer la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value)
    };

    try {
        if (currentEditId) {
            await updateProduct(currentEditId, productData);
        } else {
            await createProduct(productData);
        }

        resetForm();
        await loadProducts();

    } catch (error) {
        showError(error.message);
        console.error('Erreur:', error);
    }
}

// Créer un nouveau produit
async function createProduct(productData) {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
    }

    return await response.json();
}

// Modifier un produit
async function updateProduct(id, productData) {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la modification du produit');
    }

    return await response.json();
}

// Préparer le formulaire pour l'édition
async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
            throw new Error('Produit introuvable');
        }

        const product = await response.json();

        // Remplir le formulaire
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;

        // Modifier l'interface
        currentEditId = id;
        formTitle.textContent = 'Modifier le produit';
        submitBtn.textContent = 'Enregistrer les modifications';
        cancelBtn.style.display = 'block';

        // Scroll vers le formulaire
        productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        showError(error.message);
        console.error('Erreur:', error);
    }
}

// Supprimer un produit
async function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du produit');
        }

        await loadProducts();

    } catch (error) {
        showError(error.message);
        console.error('Erreur:', error);
    }
}

// Réinitialiser le formulaire
function resetForm() {
    productForm.reset();
    document.getElementById('product-id').value = '';
    currentEditId = null;
    formTitle.textContent = 'Ajouter un produit';
    submitBtn.textContent = 'Ajouter le produit';
    cancelBtn.style.display = 'none';
}

// Afficher/masquer le loading
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    productsContainer.style.display = show ? 'none' : 'grid';
}

// Afficher un message d'erreur
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';

    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Masquer le message d'erreur
function hideError() {
    errorMessageElement.style.display = 'none';
}

// Échapper les caractères HTML pour éviter les failles XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
