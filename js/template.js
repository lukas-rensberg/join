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
}

/**
 * Creates HTML structure for a subtask item
 * @param {string} text - The subtask text content (will be escaped to prevent XSS)
 * @returns {string} HTML string for the subtask
 */
export function createSubtaskHTML(text) {
  return `
    <span class="subtask-text">${text}</span>
    <div class="subtask-actions">
      <img src="./assets/icons/edit.svg" alt="Edit" onclick="startEditingSubtask(this)" />
      <span class="subtask-separator"></span>
      <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(this)" />
    </div>
  `;
}

/**
 * Creates HTML for edit mode action buttons
 * @returns {string} HTML string for edit actions
 */
export function createEditActionsHTML() {
  return `
    <img src="./assets/icons/delete.svg" alt="Cancel" class="cancel-edit" onclick="cancelEdit(this)" />
    <span class="subtask-separator"></span>
    <img src="./assets/icons/check-blue.svg" alt="Save" class="save-edit" onclick="saveEdit(this)" />
  `;
}

/**
 * Creates HTML for normal mode action buttons (edit and delete)
 * @returns {string} HTML string for normal actions
 */
export function createNormalActionsHTML() {
  return `
    <img src="./assets/icons/edit.svg" alt="Edit" onclick="startEditingSubtask(this)" />
    <span class="subtask-separator"></span>
    <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(this)" />
  `;
}