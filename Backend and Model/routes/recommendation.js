const express = require("express");
const router = express.Router();

const FLASK_URL = process.env.FLASK_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────
// Helper: forward requests to the Python Flask microservice
// ─────────────────────────────────────────────────────────
async function callFlask(path) {
  const url = `${FLASK_URL}${path}`;
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

// ─────────────────────────────────────────────────────────
// GET /api/recommendations?user_id=123&top_n=3
//
// Returns hybrid (KNN + content-based) product subcategory
// recommendations for a given customer.
//
// Query params:
//   user_id  (required) — customer ID from your dataset
//   top_n    (optional) — number of results, default 3, max 10
// ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const { user_id, top_n } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const params  = new URLSearchParams({ user_id, ...(top_n && { top_n }) });
    const { status, data } = await callFlask(`/recommend?${params}`);
    return res.status(status).json(data);
  } catch (err) {
    console.error("[Recommendations] Flask error:", err.message);
    return res.status(502).json({
      error: "Recommendation service unavailable. Make sure recommend.py is running.",
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/health
// Pings the Python service and returns its status
// ─────────────────────────────────────────────────────────
router.get("/health", async (req, res) => {
  try {
    const { status, data } = await callFlask("/health");
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Flask service unreachable" });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/users
// Returns a sample list of valid user IDs (for testing)
// ─────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { status, data } = await callFlask("/users");
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Flask service unreachable" });
  }
});

module.exports = router;
