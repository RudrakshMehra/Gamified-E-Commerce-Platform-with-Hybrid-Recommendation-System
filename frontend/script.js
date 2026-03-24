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
// SUGGESTED PRODUCTS (SMART UI)
// =====================================
function loadSuggestions() {

    const container = document.getElementById("suggested-products");
    if (!container) return;

    // Sample products (you can expand later)
    let suggestions = [
        { id: 101, name: "Smart Watch", price: 3000, image: "https://via.placeholder.com/200" },
        { id: 102, name: "Gaming Mouse", price: 1500, image: "https://via.placeholder.com/200" },
        { id: 103, name: "Bluetooth Speaker", price: 2500, image: "https://via.placeholder.com/200" },
        { id: 104, name: "Power Bank", price: 1200, image: "https://via.placeholder.com/200" },
        { id: 105, name: "Wireless Earbuds", price: 2200, image: "https://via.placeholder.com/200" },
        { id: 106, name: "Laptop Stand", price: 900, image: "https://via.placeholder.com/200" }
    ];

    // Shuffle (random suggestions)
    suggestions.sort(() => 0.5 - Math.random());

    // Clear container
    container.innerHTML = "";

    // Show only 4 products
    suggestions.slice(0, 4).forEach(product => {

        let div = document.createElement("div");
        div.className = "product-card";

        div.innerHTML = `
            <img src="${product.image}">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <div class="reward">🎯 Earn ${Math.floor(product.price / 100)} Points</div>
            <button onclick='addToCart(${JSON.stringify(product)})'>
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