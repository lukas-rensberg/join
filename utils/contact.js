/**
 * Validates email format
 * @param {string} email Email address
 * @return {boolean} True if valid
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const AVATAR_COLORS = ["#ff7a00", "#ff5eb3", "#4589ff", "#ffc701", "#1fd7c1", "#9327ff", "#00bee8", "#ff4646"];

/**
 * Get random avatar color from predefined palette
 */
function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export { validateEmailFormat, getRandomColor };