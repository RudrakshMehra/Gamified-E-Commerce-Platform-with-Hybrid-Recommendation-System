const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer TOKEN"
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;


//api/cart routes: 
// GET /cart/:userId
// POST /cart (add)
// PUT /cart/:id (update quantity)
// DELETE /cart/:id (remove)

//api/rewards routes:
// GET /rewards/:userId
// POST /rewards (admin or automatic when XP threshold reached)