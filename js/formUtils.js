/**
 * Form Utility Functions
 * Helper functions for form manipulation and clearing with scoped container support
 */

import { selectPriority } from "./priorityManager.js";
import { clearSubtaskInput } from "./subtaskManager.js";
import { clearSelectedContacts, clearSelectedCategory } from "./dropdownManager.js";

/**
 * Clears all form input fields
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearFormInputs(container = document) {
    const titleInput = container.querySelector('.input-title');
    const descriptionInput = container.querySelector('.task-description');
    const dueDateInput = container.querySelector('.due-date-input');

    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (dueDateInput) dueDateInput.value = '';
}

/**
 * Resets priority selection to medium
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function resetPriorityToMedium(container = document) {
    const mediumButton = container.querySelector('.priority-btn.medium');
    if (mediumButton) {
        selectPriority(mediumButton, container);
    }
}

/**
 * Clears all contact selections
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearContactSelections(container = document) {
    clearSelectedContacts();
    clearContactDropzone(container);
    clearContactCheckboxes(container);
}

/**
 * Clears the contact dropzone display
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearContactDropzone(container = document) {
    const dropzone = container.querySelector('.dropzone');
    if (dropzone) {
        dropzone.innerHTML = '';
    }
}

/**
 * Clears all contact checkboxes
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearContactCheckboxes(container = document) {
    container.querySelectorAll('.contact-option').forEach(option => {
        option.classList.remove('selected');
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = false;
        }
    });
}

/**
 * Clears category selection
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearCategorySelection(container = document) {
    clearSelectedCategory();
    resetCategoryDisplay(container);
    clearCategoryOptions(container);
}

/**
 * Resets category display to default text
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function resetCategoryDisplay(container = document) {
    const categoryDisplay = container.querySelector('.category-display');
    if (categoryDisplay) {
        categoryDisplay.textContent = 'Select task category';
    }
}

/**
 * Clears all category option selections
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearCategoryOptions(container = document) {
    container.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });
}

/**
 * Clears subtasks section
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function clearSubtasksSection(container = document) {
    const subtaskList = container.querySelector('.subtask-list');
    if (subtaskList) {
        subtaskList.innerHTML = '';
    }
    clearSubtaskInput(container);
}
