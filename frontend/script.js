// =====================================
// STORAGE HELPERS
// =====================================
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// =====================================
// AUTH SYSTEM (FIXED)
// =====================================
function getUser() {
    return getFromStorage("user");
}

function isLoggedIn() {
    return !!getUser();
}

// REGISTER
function register() {

    const name = document.getElementById("regName")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const password = document.getElementById("regPassword")?.value.trim();

    if (!name || !email || !password) {
        showToast("Please fill all fields ⚠️");
        return;
    }

    const user = {
        name: name,
        email: email,
        password: btoa(password)
    };

    localStorage.setItem("user", JSON.stringify(user));

    showToast("Registration successful 🎉");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

// LOGIN
function login() {

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();

    const user = getUser();

    if (!user) {
        showToast("No account found ❌");
        return;
    }

    if (user.email === email && user.password === btoa(password)) {

        showToast("Login successful 🎉");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } else {
        showToast("Invalid credentials ❌");
    }
}


function logout() {
    localStorage.removeItem("user");
    showToast("Logged out 👋");
    setTimeout(() => window.location.href = "login.html", 800);
}

// =====================================
// CART SYSTEM (UNIFIED)
// =====================================
function getCart() {
    return getFromStorage("cart") || [];
}

function saveCart(cart) {
    saveToStorage("cart", cart);
}

// ADD TO CART (used everywhere)
function addToCart(product) {

    let cart = getCart();

    let existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart(cart);
    updateCartCount();

    // XP reward
    addXP(10);

    showToast(product.name + " added to cart 🎉");
}

// =====================================
// CART COUNT
// =====================================
function updateCartCount() {
    let cart = getCart();
    let countEl = document.getElementById("cart-count");

    if (!countEl) return;

    let total = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.innerText = total;
}

// =====================================
// DISPLAY CART
// =====================================
function displayCart() {

    let cart = getCart();

    const container = document.getElementById("cart-items");
    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty 🛒</p>";
        return;
    }

    let total = 0;
    let mrp = 0;

    cart.forEach((item, index) => {

        let itemTotal = item.price * item.qty;
        total += itemTotal;
        mrp += item.price * 1.2 * item.qty;

        let div = document.createElement("div");
        div.className = "cart-item-box";

        div.innerHTML = `
            <div class="cart-item-left">
                <img src="${item.image}">
            </div>

            <div class="cart-item-center">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>

                <div class="qty-controls">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>

                <button onclick="removeItem(${index})" class="remove-btn">
                    REMOVE
                </button>
            </div>
        `;

        container.appendChild(div);
    });

    let discount = Math.round(mrp - total);

    document.getElementById("cart-total").innerText = total;
    document.getElementById("mrp-total").innerText = Math.round(mrp);
    document.getElementById("discount-total").innerText = discount;
    document.getElementById("save-amount").innerText = discount;
}

// CATEGORY FILTER
function filterProducts(category, event) {

    let products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        let cat = product.getAttribute("data-category");

        if (category === "all" || cat === category) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });

    // Highlight active category
    document.querySelectorAll(".category").forEach(c => {
        c.classList.remove("active");
    });

    event.currentTarget.classList.add("active");

    // Scroll to products
    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}


// =====================================
// SUGGESTED PRODUCTS (ML-POWERED)
// =====================================

// Maps ML subcategory names → display product info
const SUBCATEGORY_PRODUCTS = {
    "Laptop":       { id: 201, name: "Laptop",            price: 55000, image: "https://via.placeholder.com/200?text=Laptop" },
    "Mobile":       { id: 202, name: "Smartphone",        price: 22000, image: "https://via.placeholder.com/200?text=Mobile" },
    "Accessories":  { id: 203, name: "Wireless Earbuds",  price: 2200,  image: "https://via.placeholder.com/200?text=Accessories" },
    "Men":          { id: 204, name: "Men's Jacket",       price: 2500,  image: "https://via.placeholder.com/200?text=Men" },
    "Women":        { id: 205, name: "Women's Dress",      price: 1800,  image: "https://via.placeholder.com/200?text=Women" },
    "Sports":       { id: 206, name: "Sports Shoes",       price: 3000,  image: "https://via.placeholder.com/200?text=Sports" },
    "Furniture":    { id: 207, name: "Office Chair",       price: 12000, image: "https://via.placeholder.com/200?text=Furniture" },
    "Kitchen":      { id: 208, name: "Microwave",          price: 7000,  image: "https://via.placeholder.com/200?text=Kitchen" },
    "Decor":        { id: 209, name: "Wall Art Set",       price: 1500,  image: "https://via.placeholder.com/200?text=Decor" },
};

// Fallback shown when user is not logged in or not in the ML dataset
const FALLBACK_SUGGESTIONS = [
    { id: 301, name: "Smart Watch",       price: 5000,  image: "https://via.placeholder.com/200?text=Watch" },
    { id: 302, name: "Bluetooth Speaker", price: 2500,  image: "https://via.placeholder.com/200?text=Speaker" },
    { id: 303, name: "Power Bank",        price: 1200,  image: "https://via.placeholder.com/200?text=PowerBank" },
    { id: 304, name: "Wireless Earbuds",  price: 2200,  image: "https://via.placeholder.com/200?text=Earbuds" },
];

async function loadSuggestions() {

    const container = document.getElementById("suggested-products");
    if (!container) return;

    // Show loading skeleton
    container.innerHTML = `
        <div class="suggestion-loading">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    `;

    const user = getUser();

    // If not logged in or no user_id → show fallback
    if (!user || !user.user_id) {
        renderSuggestions(FALLBACK_SUGGESTIONS, false);
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:5000/api/recommendations?user_id=${user.user_id}&top_n=4`
        );

        if (!res.ok) throw new Error("API error: " + res.status);

        const data = await res.json();

        if (!data.recommendations || data.recommendations.length === 0) {
            renderSuggestions(FALLBACK_SUGGESTIONS, false);
            return;
        }

        // Map subcategory names → product cards
        const products = data.recommendations
            .map(rec => {
                const product = SUBCATEGORY_PRODUCTS[rec.subcategory];
                if (!product) return null;
                return { ...product, mlScore: rec.score, subcategory: rec.subcategory };
            })
            .filter(Boolean);

        if (products.length === 0) {
            renderSuggestions(FALLBACK_SUGGESTIONS, false);
            return;
        }

        renderSuggestions(products, true);

    } catch (err) {
        console.warn("[ShopXP] ML recommendations unavailable, using fallback.", err);
        renderSuggestions(FALLBACK_SUGGESTIONS, false);
    }
}

function renderSuggestions(products, isPersonalized) {

    const container = document.getElementById("suggested-products");
    if (!container) return;

    // Update section heading to reflect personalisation
    const heading = document.querySelector(".suggest-section h2");
    if (heading) {
        heading.innerHTML = isPersonalized
            ? "🤖 Recommended For You <span class='ml-badge'>AI-Powered</span>"
            : "🔥 Suggested For You";
    }

    container.innerHTML = "";

    products.forEach(product => {
        let div = document.createElement("div");
        div.className = "product-card";

        const matchLabel = product.subcategory
            ? `<div class="reward">🏷️ ${product.subcategory}</div>`
            : `<div class="reward">🎯 Earn ${Math.floor(product.price / 100)} Points</div>`;

        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price.toLocaleString("en-IN")}</p>
            ${matchLabel}
            <button onclick='addToCart(${JSON.stringify({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            })})'>
                Add to Cart
            </button>
        `;

        container.appendChild(div);
    });
}


// =====================================
// CART ACTIONS
// =====================================
function changeQty(index, delta) {
    let cart = getCart();

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    displayCart();
    updateCartCount();
}

function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
    updateCartCount();
}

// =====================================
// CHECKOUT + XP
// =====================================
function checkout() {

    let cart = getCart();

    if (cart.length === 0) {
        showToast("Cart is empty ⚠️");
        return;
    }

    showToast("Order placed 🎉");

    // Give XP
    addXP(100);

    saveCart([]);
    displayCart();
    updateCartCount();
}

// =====================================
// XP SYSTEM (CONNECTED 🔥)
// =====================================
function getXP() {
    return parseInt(localStorage.getItem("xp")) || 0;
}

function addXP(amount) {
    let xp = getXP();
    xp += amount;
    localStorage.setItem("xp", xp);
}

// =====================================
// TOAST
// =====================================
function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}

// =====================================
// MENU
// =====================================
function toggleMenu() {
    document.getElementById("nav")?.classList.toggle("active");
}

// =====================================
// INIT
// =====================================
document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

    if (document.getElementById("cart-items")) {
        displayCart();
    }

    loadSuggestions();

    // Protect pages
    if (
        window.location.pathname.includes("profile.html") ||
        window.location.pathname.includes("reward.html")
    ) {
        if (!isLoggedIn()) {
            window.location.href = "login.html";
        }
    }
});