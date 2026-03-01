console.log("✅ Product routes loaded");

const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");

const router = express.Router();

//////////////////////////////////////////////
// ✅ MULTER CONFIG (image upload)
//////////////////////////////////////////////

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

//////////////////////////////////////////////
// ✅ CREATE PRODUCT (WITH IMAGE)
//////////////////////////////////////////////

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imagePath = req.file.filename;

    const result = await pool.query(
      `INSERT INTO products(name, price, category, image)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [name, price, category, imagePath]
    );

    res.json({
      message: "Product created successfully",
      product: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////////////////////
// ✅ GET ALL PRODUCTS
//////////////////////////////////////////////

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;