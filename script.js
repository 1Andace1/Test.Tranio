document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const priceRange = document.getElementById('price-range');
    const priceRangeValue = document.getElementById('price-range-value');
    const sortBy = document.getElementById('sort-by');

    let products = [];
    let categories = [];

    fetch('data/cards.json')
        .then(response => response.json())
        .then(data => {
            products = data.products;
            categories = data.categories;
            displayProducts(products);
            displayCategoryFilters(categories);
        });

    function displayCategoryFilters(categories) {
        categoryFilters.innerHTML = categories.map(category =>
            `<div>
                <input type="checkbox" id="category-${category}" value="${category}">
                <label for="category-${category}">${category}</label>
            </div>`
        ).join('');
    }

    function getImageSource(product) {
        if (window.matchMedia("(max-width: 480px)").matches) {
            return product.image.mobile;
        } else if (window.matchMedia("(max-width: 768px)").matches) {
            return product.image.tablet;
        } else {
            return product.image.desktop; 
        }
    }

    function displayProducts(products) {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img data-src="${getImageSource(product)}" alt="${product.name}" class="lazy-load">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Цена: $${product.price}</p>
                <p>Рейтинг: ${product.rating}</p>
                <p>Категория: ${product.category}</p>
            </div>
        `).join('');

        const lazyImages = document.querySelectorAll('img.lazy-load');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => observer.observe(img));
    }

    function filterAndSortProducts() {
        const selectedCategories = Array.from(document.querySelectorAll('#category-filters input[type="checkbox"]:checked')).map(input => input.value);
        const maxPrice = parseInt(priceRange.value);

        let filteredProducts = products.filter(product =>
            (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
            product.price <= maxPrice
        );

        filteredProducts.sort((a, b) => {
            if (sortBy.value === 'price') return a.price - b.price;
            if (sortBy.value === 'rating') return b.rating - a.rating;
            if (sortBy.value === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        displayProducts(filteredProducts);
    }

    categoryFilters.addEventListener('change', filterAndSortProducts);
    priceRange.addEventListener('input', function() {
        priceRangeValue.textContent = `0 - ${priceRange.value}`;
        filterAndSortProducts();
    });
    sortBy.addEventListener('change', filterAndSortProducts);
});
