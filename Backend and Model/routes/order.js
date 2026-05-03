const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { calculateXP, calculateLevel, calculateCoins } = require("../utils/xpCalculator");

const router = express.Router();

// POST /api/orders/place
router.post("/place", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const user_id = req.user.id;
    const { items, payment_method } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Invalid order data" });

    const validMethods = ["cod", "upi", "card"];
    const method = validMethods.includes(payment_method) ? payment_method : "cod";

    await client.query("BEGIN");

    let totalAmount = 0;
    for (const item of items) {
      const p = await client.query("SELECT price FROM products WHERE id=$1", [item.product_id]);
      if (!p.rows.length) throw new Error("Product not found: " + item.product_id);
      totalAmount += Number(p.rows[0].price) * item.quantity;
    }

    const orderResult = await client.query(
      "INSERT INTO orders(user_id, status, payment_method) VALUES($1,$2,$3) RETURNING *",
      [user_id, "completed", method]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items(order_id,product_id,quantity) VALUES($1,$2,$3)",
        [orderId, item.product_id, item.quantity]
      );
    }

    const xpEarned    = calculateXP(totalAmount);
    const coinsEarned = calculateCoins(totalAmount);
    const userData    = await client.query("SELECT xp, coins FROM users WHERE id=$1", [user_id]);
    const newXP       = userData.rows[0].xp + xpEarned;
    const newLevel    = calculateLevel(newXP);
    const newCoins    = userData.rows[0].coins + coinsEarned;

    await client.query("UPDATE users SET xp=$1, level=$2, coins=$3 WHERE id=$4",
      [newXP, newLevel, newCoins, user_id]);
    await client.query("DELETE FROM cart WHERE user_id=$1", [user_id]);
    await client.query("COMMIT");

    res.json({
      message: "Order placed successfully",
      orderId,
      payment_method: method,
      xpEarned,
      coinsEarned,
      newXP,
      newLevel,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
