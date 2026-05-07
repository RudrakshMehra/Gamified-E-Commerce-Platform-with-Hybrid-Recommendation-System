const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes           = require("./routes/auth");
const orderRoutes          = require("./routes/order");
const productRoutes        = require("./routes/product");
const cartRoutes           = require("./routes/cart");
const contactRoutes        = require("./routes/contact");
const recommendationRoutes = require("./routes/recommendation"); // ← NEW

const app = express();

app.use(cors());
app.use(express.json());

// Make uploads folder publicly accessible
app.use("/uploads", express.static("uploads"));

// ── Existing routes ──────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api",          contactRoutes);

// ── ML Recommendation routes ─────────────────────────────
// GET /api/recommendations?user_id=<id>&top_n=<n>
// GET /api/recommendations/health
// GET /api/recommendations/users
app.use("/api/recommendations", recommendationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
