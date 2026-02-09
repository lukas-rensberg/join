/**
 * Form Validation Functions
 * Handles validation logic for task forms with scoped container support
 */

import { isValidDate } from "./dateInputManager.js";
import { getSelectedCategory } from "./dropdownManager.js";

/**
 * Validates the task form
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export function validateTaskForm(container = document) {
    const errors = {
        title: validateTitle(container),
        dueDate: validateDueDate(container),
        category: validateCategory()
    };

    const isValid = !errors.title && !errors.dueDate && !errors.category;

    return { isValid, errors };
}

/**
 * Validates the title field
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string|null} Error message or null if valid
 */
export function validateTitle(container = document) {
    const title = container.querySelector('.input-title')?.value?.trim();
    return !title ? 'Title is required' : null;
}

/**
 * Validates the due date field
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string|null} Error message or null if valid
 */
export function validateDueDate(container = document) {
    const dueDate = container.querySelector('.due-date-input')?.value;

    if (!dueDate) {
        return 'Due date is required';
    }

    if (!isValidDate(dueDate)) {
        return 'Please enter a valid date (dd/mm/yyyy)';
    }

    return null;
}

/**
 * Validates the category field
 * @returns {string|null} Error message or null if valid
 */
export function validateCategory() {
    const category = getSelectedCategory();
    return !category ? 'Please select a category' : null;
}
