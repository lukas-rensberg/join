/**
 * Create error message element for authentication errors
 * @param {string} message - The error message to display
 * @returns {HTMLElement} The error message div element
 */
export function createAuthErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "auth-error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff0000;
    font-size: 0.7rem;
    margin-top: 0.5rem;
    width: 90%;
  `;
  return errorDiv;
};




