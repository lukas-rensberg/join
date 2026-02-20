import { isValidDate } from "./dateInputManager.js";
import { getSelectedCategory } from "./dropdownManager.js";
import { containsHtmlChars } from "./template.js";

const HACK_ATTEMPT_MSG = "Want to hack me? Nah Ah! Use no special chars";

/**
 * Validates the task form
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export function validateTaskForm(container) {
    const errors = {
        title: validateTitle(container),
        description: validateDescription(container),
        dueDate: validateDueDate(container),
        category: validateCategory()
    };
    const isValid = !errors.title && !errors.description && !errors.dueDate && !errors.category;

    return { isValid, errors };
}

/**
 * Validates the title field
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string|null} Error message or null if valid
 */
export function validateTitle(container) {
    const title = container.querySelector('.input-title')?.value?.trim();
    if (!title) return 'Title is required';
    if (containsHtmlChars(title)) return HACK_ATTEMPT_MSG;
    return null;
}

/**
 * Validates the description field for HTML special characters
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string|null} Error message or null if valid
 */
export function validateDescription(container) {
    const description = container.querySelector('.task-description')?.value?.trim();
    if (description && containsHtmlChars(description)) return HACK_ATTEMPT_MSG;
    return null;
}

/**
 * Validates the due date field.
 * Reads from the visible calendar input which holds the dd/mm/yyyy formatted value.
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string|null} Error message or null if valid
 */
export function validateDueDate(container) {
    const dueDate = container.querySelector('.calendar-date-picker-input')?.value;
    if (!dueDate) return 'Due date is required';
    if (!isValidDate(dueDate)) return 'Please enter a valid date (dd/mm/yyyy)';

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
