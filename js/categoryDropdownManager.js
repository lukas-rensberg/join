/**
 * @fileoverview Manages the category dropdown: populating category options,
 * handling selection, preselection, and exposing category state getters/setters.
 */

import {getCategoryDropdownOptionsHTML} from "./template.js";
import {toggleDropdown} from "./dropdownManager.js";

/**
 * Available task categories.
 * @type {Array<{id: string, name: string}>}
 */
const categories = [
    {id: 'technical', name: 'Technical Task'},
    {id: 'user-story', name: 'User Story'}
];

/** @type {Object|null} Currently selected category object or null */
let selectedCategory = null;

/**
 * Populates the category dropdown with the available category options.
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function populateCategoriesDropdown(container) {
    const dropdownContent = container.querySelector('.category-dropdown-content');
    if (!dropdownContent) return;

    dropdownContent.innerHTML = getCategoryDropdownOptionsHTML();
}

/**
 * Selects a category by ID, updates the display text, highlights the option,
 * and closes the category dropdown.
 * @param {string} categoryId - The category ID to select
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function selectCategory(categoryId, container) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    selectedCategory = category;
    container.querySelector('.category-display').textContent = category.name;

    container.querySelectorAll('.category-option').forEach(
        option => option.classList.remove('selected'));

    container.querySelector(`[data-category-id="${categoryId}"]`).classList.add('selected');

    toggleDropdown('category', false, container);
}

/**
 * Preselects a category based on the task type name without opening the dropdown.
 * @param {string} taskType - The task type name (e.g., "User Story", "Technical Task")
 * @param {HTMLElement|Document} container - The container element to scope queries
 * @returns {void}
 */
export function preselectCategory(taskType, container) {
    if (!taskType) return;
    const categoryMap = {'User Story': 'user-story', 'Technical Task': 'technical'};
    const categoryId = categoryMap[taskType];
    if (!categoryId) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    selectedCategory = category;
    const categoryDisplay = container.querySelector('.category-display');
    if (categoryDisplay) categoryDisplay.textContent = category.name;
    container.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedOption = container.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedOption) selectedOption.classList.add('selected');
}

/**
 * Returns the currently selected category object.
 * @returns {Object|null} The selected category or null if none is selected
 */
export function getSelectedCategory() {
    return selectedCategory;
}

/**
 * Sets the currently selected category.
 * @param {Object|null} value - The category object to set, or null to clear
 * @returns {void}
 */
export function setSelectedCategory(value) {
    selectedCategory = value;
}

