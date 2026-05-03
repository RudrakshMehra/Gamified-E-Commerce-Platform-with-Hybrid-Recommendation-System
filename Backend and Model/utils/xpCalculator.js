// utils/xpCalculator.js
// XP rule: ₹100 spent = 1 XP  (matches what product cards display)

function calculateXP(amount) {
  return Math.floor(amount / 100);
}

function calculateLevel(xp) {
  return Math.floor(xp / 500) + 1;
}

function calculateCoins(amount) {
  // 1 coin per ₹100 spent
  return Math.floor(amount / 100);
}

module.exports = { calculateXP, calculateLevel, calculateCoins };
