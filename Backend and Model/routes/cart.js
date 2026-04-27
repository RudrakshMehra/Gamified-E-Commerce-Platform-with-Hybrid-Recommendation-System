const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

//////////////////////////////////
// ✅ ADD ITEM TO CART
//////////////////////////////////
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Product and quantity required" });
    }

    // check if item already in cart
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id=$1 AND product_id=$2",
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      // update quantity
      await pool.query(
        "UPDATE cart SET quantity=$1 WHERE user_id=$2 AND product_id=$3",
        [quantity, user_id, product_id]
      );
      return res.json({ message: "Cart updated successfully" });
    }

    // add new item
    const result = await pool.query(
      "INSERT INTO cart(user_id, product_id, quantity) VALUES($1,$2,$3) RETURNING *",
      [user_id, product_id, quantity]
    );

    res.json({ message: "Item added to cart", cart: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//////////////////////////////////
// ✅ GET CART ITEMS
//////////////////////////////////
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id=$1`,
      [user_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//////////////////////////////////
// ✅ UPDATE CART ITEM QUANTITY
//////////////////////////////////
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const cart_id = req.params.id;
    const user_id = req.user.id;
    const { quantity } = req.body;

    await pool.query(
      "UPDATE cart SET quantity=$1 WHERE id=$2 AND user_id=$3",
      [quantity, cart_id, user_id]
    );

    res.json({ message: "Cart updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//////////////////////////////////
// ✅ REMOVE ITEM FROM CART
//////////////////////////////////
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const cart_id = req.params.id;
    const user_id = req.user.id;

    await pool.query(
      "DELETE FROM cart WHERE id=$1 AND user_id=$2",
      [cart_id, user_id]
    );

    res.json({ message: "Item removed from cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;