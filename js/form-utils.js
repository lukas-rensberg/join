/**
 * Form Utility Functions
 * Helper functions for form manipulation and clearing
 */

import { selectPriority } from "./priority-manager.js";
import { clearSubtaskInput } from "./subtask-manager.js";
import { clearSelectedContacts, clearSelectedCategory } from "./dropdown-manager.js";

/**
 * Clears all form input fields
 * @returns {void}
 */
export function clearFormInputs() {
    const titleInput = document.querySelector('.task-title');
    const descriptionInput = document.querySelector('.task-description');
    const dueDateInput = document.getElementById('dueDate');

    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (dueDateInput) dueDateInput.value = '';
}

/**
 * Resets priority selection to medium
 * @returns {void}
 */
export function resetPriorityToMedium() {
    const mediumButton = document.querySelector('.priority-btn.medium');
    if (mediumButton) {
        selectPriority(mediumButton);
    }
}

/**
 * Clears all contact selections
 * @returns {void}
 */
export function clearContactSelections() {
    clearSelectedContacts();
    clearContactDropzone();
    clearContactCheckboxes();
}

/**
 * Clears the contact dropzone display
 * @returns {void}
 */
export function clearContactDropzone() {
    const dropzone = document.querySelector('.dropzone');
    if (dropzone) {
        dropzone.innerHTML = '';
    }
}

/**
 * Clears all contact checkboxes
 * @returns {void}
 */
export function clearContactCheckboxes() {
    document.querySelectorAll('.contact-option').forEach(option => {
        option.classList.remove('selected');
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = false;
        }
    });
}

/**
 * Clears category selection
 * @returns {void}
 */
export function clearCategorySelection() {
    clearSelectedCategory();
    resetCategoryDisplay();
    clearCategoryOptions();
}

/**
 * Resets category display to default text
 * @returns {void}
 */
export function resetCategoryDisplay() {
    const categoryDisplay = document.getElementById('categoryDisplay');
    if (categoryDisplay) {
        categoryDisplay.textContent = 'Select task category';
    }
}

/**
 * Clears all category option selections
 * @returns {void}
 */
export function clearCategoryOptions() {
    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });
}

/**
 * Clears subtasks section
 * @returns {void}
 */
export function clearSubtasksSection() {
    const subtaskList = document.getElementById('subtaskList');
    if (subtaskList) {
        subtaskList.innerHTML = '';
    }
    clearSubtaskInput();
}

