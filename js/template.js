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

/**
 * Generates an HTML template for a section header with the given letter.
 * @param {string} letter - The letter to display as the section header.
 * @returns {string} The HTML string for the section header and separator.
 */
export function generateSectionTemplate(letter) {
  return `
            <h2 class="section-header">${letter}</h2>
            <div class="section-separator"></div>
        `
};

/**
 * Generates an HTML template string for a contact item.
 * @param {Object} contact - The contact object containing details to display.
 * @param {string} contact.avatarColor - The background color for the contact's avatar.
 * @param {string} contact.initials - The initials to display in the avatar.
 * @param {string} contact.name - The contact's full name.
 * @param {string} contact.email - The contact's email address.
 * @returns {string} The HTML string representing the contact item.
 */
export function generateContactItemTemplate(contact) {
  return `
                <div class="contact-avatar" style="background-color: ${contact.avatarColor};">${contact.initials}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-email">${contact.email}</div>
                </div>
            `;
}



