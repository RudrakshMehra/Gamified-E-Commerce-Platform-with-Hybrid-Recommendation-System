const API_URL = "http://localhost:5000/api";

/* =========================
   NAVBAR MENU
========================= */
function toggleMenu(){
    const nav = document.getElementById("nav");
    nav.classList.toggle("show");
}

/* =========================
   REGISTER
========================= */
async function register(){
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try{
        const res = await fetch(API_URL + "/auth/register",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ name,email,password })
        });

        const data = await res.json();

        if(res.ok){
            alert("Registration successful");
            window.location.href = "login.html";
        }else{
            alert(data.message || "Registration failed");
        }

    }catch(err){
        console.error(err);
        alert("Server error");
    }
}

/* =========================
   LOGIN
========================= */
async function login(){
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try{
        const res = await fetch(API_URL + "/auth/login",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ email,password })
        });

        const data = await res.json();

        if(res.ok){
            localStorage.setItem("token",data.token);
            localStorage.setItem("loggedIn",true);
            localStorage.setItem("user",JSON.stringify(data.user));

            alert("Login successful");
            window.location.href = "index.html";
        }else{
            alert(data.message || "Login failed");
        }

    }catch(err){
        console.error(err);
        alert("Server error");
    }
}

/* =========================
   LOAD PRODUCTS
========================= */
async function loadProducts(){

    const container = document.getElementById("products");
    if(!container) return;

    try{
        const res = await fetch(API_URL + "/products");
        const products = await res.json();

        container.innerHTML = "";

        products.forEach(product=>{

            const imageURL = "http://localhost:5000/uploads/" + product.image;

            container.innerHTML += `
            <article class="product-card">
                <img src="${imageURL}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <button onclick="addToCart(${product.id},'${product.name}',${product.price})">
                    Add to Cart
                </button>
            </article>`;
        });

    }catch(err){
        console.error(err);
    }
}

/* =========================
   CART STORAGE
========================= */
function getCart(){
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart));
}

/* =========================
   ADD TO CART
========================= */
function addToCart(id,name,price){

    let cart = getCart();
    const item = cart.find(p=>p.id === id);

    if(item){
        item.quantity += 1;
    }else{
        cart.push({
            id,
            name,
            price,
            quantity:1,
            selected:true   // ✅ auto selected
        });
    }

    saveCart(cart);
    updateCartCount();
    alert("Added to cart");
}

/* =========================
   CART COUNT
========================= */
function updateCartCount(){
    const cart = getCart();
    const count = cart.reduce((sum,item)=>sum + item.quantity,0);
    const el = document.getElementById("cart-count");
    if(el) el.innerText = count;
}

/* =========================
   LOAD CART WITH CHECKBOXES
========================= */
function loadCart(){

    const container = document.getElementById("cart-items");
    if(!container) return;

    const cart = getCart();
    container.innerHTML = "";

    if(cart.length === 0){
        container.innerHTML = "<h3>Your cart is empty</h3>";
        calculateTotal();
        return;
    }

    cart.forEach(item=>{

        container.innerHTML += `
        <div class="cart-item-box">

            <!-- SELECT CHECKBOX -->
            <input type="checkbox"
                   onchange="toggleItem(${item.id})"
                   ${item.selected ? "checked" : ""}>

            <div class="cart-item-center">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>

                <div class="qty-controls">
                    <button onclick="changeQty(${item.id},-1)">-</button>
                    ${item.quantity}
                    <button onclick="changeQty(${item.id},1)">+</button>
                </div>
            </div>

        </div>`;
    });

    calculateTotal();
}

/* =========================
   TOGGLE SINGLE ITEM
========================= */
function toggleItem(id){

    let cart = getCart();
    const item = cart.find(p=>p.id === id);

    if(!item) return;

    item.selected = !item.selected;

    saveCart(cart);
    calculateTotal();
}

/* =========================
   SELECT / DESELECT ALL
========================= */
function toggleAll(checkbox){

    let cart = getCart();

    cart.forEach(item=>{
        item.selected = checkbox.checked;
    });

    saveCart(cart);
    loadCart();
}

/* =========================
   CALCULATE TOTAL (SELECTED ONLY)
========================= */
function calculateTotal(){

    const cart = getCart();

    let total = 0;

    cart.forEach(item=>{
        if(item.selected){
            total += item.price * item.quantity;
        }
    });

    document.getElementById("mrp-total").innerText = total;
    document.getElementById("cart-total").innerText = total;
}

/* =========================
   CHANGE QUANTITY
========================= */
function changeQty(id,amount){

    let cart = getCart();
    const item = cart.find(p=>p.id === id);

    if(!item) return;

    item.quantity += amount;

    if(item.quantity <= 0){
        cart = cart.filter(p=>p.id !== id);
    }

    saveCart(cart);
    loadCart();
    updateCartCount();
}

/* =========================
   CHECKOUT (SELECTED ITEMS ONLY)
========================= */
async function checkout(){

    const token = localStorage.getItem("token");

    if(!token){
        alert("Please login first");
        window.location.href="login.html";
        return;
    }

    const cart = getCart().filter(item => item.selected);

    if(cart.length === 0){
        alert("Select items to buy");
        return;
    }

    try{
        const res = await fetch(API_URL + "/orders",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },
            body:JSON.stringify({ items:cart })
        });

        const data = await res.json();

        if(res.ok){
            alert("Order placed successfully");

            // remove only purchased items
            let remaining = getCart().filter(item => !item.selected);
            saveCart(remaining);

            window.location.href="index.html";
        }else{
            alert(data.message);
        }

    }catch(err){
        console.error(err);
    }
}

/* =========================
   PROFILE
========================= */
function loadProfile(){

    const user = JSON.parse(localStorage.getItem("user"));
    if(!user) return;

    const name = document.getElementById("profileName");
    const email = document.getElementById("profileEmail");

    if(name) name.innerText = user.name;
    if(email) email.innerText = user.email;
}

function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    window.location.href="login.html";
}

/* =========================
   PAGE LOAD
========================= */
document.addEventListener("DOMContentLoaded",()=>{

    updateCartCount();
    loadProducts();
    loadCart();
    loadProfile();

});


async function sendContact(){

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const message = document.getElementById("contactMessage").value;

    try{

        const res = await fetch("http://localhost:5000/api/contact",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name,
                email,
                message
            })
        });

        const data = await res.json();

        if(res.ok){
            alert("Message sent successfully!");
        }else{
            alert(data.message);
        }

    }catch(err){
        console.error(err);
        alert("Server error");
    }
}