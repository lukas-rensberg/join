/**
 * Validates email format
 * @param {string} email Email address
 * @return {boolean} True if valid
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { validateEmailFormat };