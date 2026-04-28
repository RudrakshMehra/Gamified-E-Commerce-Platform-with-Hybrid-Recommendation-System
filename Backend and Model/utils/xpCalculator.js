// utils/xpCalculator.js

function calculateXP(amount) {
  // example rule: 1 rupee spent = 1 XP
  return Math.floor(amount);
}

function calculateLevel(xp) {
  // simple leveling formula
  // level increases every 100 XP
  return Math.floor(xp / 500) + 1;
}

function calculateCoins(amount) {
  // reward coins: 10% of amount
  return Math.floor(amount * 0.1);
}

module.exports = {
  calculateXP,
  calculateLevel,
  calculateCoins,
};