/**
 * Form Validation Functions
 * Handles validation logic for task forms
 */

import { isValidDate } from "./date-input-manager.js";
import { getSelectedCategory } from "./dropdown-manager.js";

/**
 * Validates the task form
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export function validateTaskForm() {
    const errors = {
        title: validateTitle(),
        dueDate: validateDueDate(),
        category: validateCategory()
    };

    const isValid = !errors.title && !errors.dueDate && !errors.category;

    return { isValid, errors };
}

/**
 * Validates the title field
 * @returns {string|null} Error message or null if valid
 */
export function validateTitle() {
    const title = document.querySelector('.task-title')?.value?.trim();
    return !title ? 'Title is required' : null;
}

/**
 * Validates the due date field
 * @returns {string|null} Error message or null if valid
 */
export function validateDueDate() {
    const dueDate = document.getElementById('dueDate')?.value;

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

