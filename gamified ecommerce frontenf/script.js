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
// CART SYSTEM
// =====================================
let cart = getFromStorage("cart") || [];

function saveCart() {
    saveToStorage("cart", cart);
}

// =====================================
// ADD TO CART (Redirect to cart page)
// =====================================
function addToCart(name, price) {

    price = Number(price); // Ensure price is number

    cart = getFromStorage("cart") || [];

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast("Item added to cart 🎉");

    // Redirect to cart page
    setTimeout(() => {
        window.location.href = "cart.html";
    }, 600);
}

// =====================================
// UPDATE CART COUNT
// =====================================
function updateCartCount() {
    cart = getFromStorage("cart") || [];

    const countElement = document.getElementById("cart-count");
    if (!countElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.innerText = totalItems;
}

// =====================================
// DISPLAY CART (FIXED)
// =====================================
function displayCart() {

    cart = getFromStorage("cart") || [];

    const cartItems = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const mrpElement = document.getElementById("mrp-total");
    const discountElement = document.getElementById("discount-total");
    const saveElement = document.getElementById("save-amount");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        if (totalElement) totalElement.innerText = 0;
        if (mrpElement) mrpElement.innerText = 0;
        if (discountElement) discountElement.innerText = 0;
        if (saveElement) saveElement.innerText = 0;
        return;
    }

    let total = 0;
    let mrp = 0;

    cart.forEach((item, index) => {

        const itemTotal = Number(item.price) * Number(item.quantity);
        total += itemTotal;

        const itemMRP = (Number(item.price) * 1.2) * Number(item.quantity);
        mrp += itemMRP;

        const div = document.createElement("div");
        div.classList.add("cart-item-box");

        div.innerHTML = `
            <div class="cart-item-left">
                <img src="https://via.placeholder.com/120">
            </div>

            <div class="cart-item-center">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>

                <div class="qty-controls">
                    <button onclick="decreaseQty(${index})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQty(${index})">+</button>
                </div>

                <button onclick="removeItem(${index})" class="remove-btn">
                    REMOVE
                </button>
            </div>
        `;

        cartItems.appendChild(div);
    });

    const discount = Math.round(mrp - total);

    if (totalElement) totalElement.innerText = total;
    if (mrpElement) mrpElement.innerText = Math.round(mrp);
    if (discountElement) discountElement.innerText = discount;
    if (saveElement) saveElement.innerText = discount;
}

// =====================================
// QUANTITY CONTROLS
// =====================================
function increaseQty(index) {
    cart = getFromStorage("cart") || [];
    cart[index].quantity += 1;
    saveCart();
    displayCart();
    updateCartCount();
}

function decreaseQty(index) {
    cart = getFromStorage("cart") || [];

    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }

    saveCart();
    displayCart();
    updateCartCount();
}

function removeItem(index) {
    cart = getFromStorage("cart") || [];
    cart.splice(index, 1);
    saveCart();
    displayCart();
    updateCartCount();
}

// =====================================
// CHECKOUT
// =====================================
function checkout() {

    cart = getFromStorage("cart") || [];

    if (cart.length === 0) {
        showToast("Cart is empty ⚠️");
        return;
    }

    showToast("Order placed successfully 🎉");

    cart = [];
    saveCart();
    displayCart();
    updateCartCount();
}

// =====================================
// REWARD SYSTEM
// =====================================
function getRewardPoints() {
    return parseInt(localStorage.getItem("points")) || 0;
}

function addRewardPoints(amount) {
    let points = getRewardPoints();
    points += amount;
    localStorage.setItem("points", points);
}

// =====================================
// AUTH SYSTEM
// =====================================
function register() {
    const name = document.getElementById("regName")?.value;
    const email = document.getElementById("regEmail")?.value;
    const password = document.getElementById("regPassword")?.value;

    if (!name || !email || !password) {
        showToast("Please fill all fields ⚠️");
        return;
    }

    const encodedPassword = btoa(password);

    saveToStorage("user", { name, email, password: encodedPassword });

    showToast("Registration successful 🎉");
    window.location.href = "login.html";
}

function login() {
    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;

    const user = getFromStorage("user");

    if (user && user.email === email && user.password === btoa(password)) {
        localStorage.setItem("loggedIn", "true");
        showToast("Login successful 🎉");
        window.location.href = "index.html";
    } else {
        showToast("Invalid credentials ❌");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    showToast("Logged out 👋");
    window.location.href = "login.html";
}

// =====================================
// PROFILE
// =====================================
function loadProfile() {
    const user = getFromStorage("user");

    const nameField = document.getElementById("profileName");
    const emailField = document.getElementById("profileEmail");
    const rewardField = document.getElementById("rewardPoints");

    if (user) {
        if (nameField) nameField.innerText = user.name;
        if (emailField) emailField.innerText = user.email;
    }

    if (rewardField) {
        rewardField.innerText = getRewardPoints();
    }
}

// =====================================
// TOAST
// =====================================
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// =====================================
// INIT
// =====================================
document.addEventListener("DOMContentLoaded", () => {

    updateCartCount();

    // Only run cart display if cart page exists
    if (document.getElementById("cart-items")) {
        displayCart();
    }

    loadProfile();

    // Protect profile page
    if (window.location.pathname.includes("profile.html")) {
        if (!localStorage.getItem("loggedIn")) {
            window.location.href = "login.html";
        }
    }
});