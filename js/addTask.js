import {
    initializeSubtasks
} from "./subtaskManager.js";

import {
    initializePriorityButtons
} from "./priorityManager.js";

import {initializeDateInput} from "./dateInputManager.js";

import {
    initializeDropdowns
} from "./dropdownManager.js";

import {createTask} from "./database.js";

import {
    showFieldError,
    clearFieldError,
    clearAllFieldErrors,
    showSuccessBanner,
    showErrorBanner
} from "./errorHandler.js";

import {validateTaskForm} from "./formValidation.js";

import {collectTaskData} from "./taskDataCollector.js";

import {
    clearFormInputs,
    resetPriorityToMedium,
    clearContactSelections,
    clearCategorySelection,
    clearSubtasksSection
} from "./formUtils.js";

let activeContainer = null;

/**
 * Stores the target category from URL parameters (for mobile redirect).
 * @type {string}
 */
let urlTargetCategory = 'to-do';

/**
 * Reads the category from URL parameters.
 * Used when redirected from the board page on mobile.
 * @returns {string} The category from the URL parameter or 'to-do' as default
 */
function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const validCategories = ['to-do', 'in-progress', 'await-feedback', 'done'];
    return validCategories.includes(category) ? category : 'to-do';
}

/**
 * Initialize all components when DOM is fully loaded
 * Only runs on addTask.html page (not on board.html where it's handled separately)
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    const isAddTaskPage = document.querySelector('.add-task-form-container');
    if (!isAddTaskPage) return;

    urlTargetCategory = getCategoryFromUrl();
    initializeAddTaskForm(isAddTaskPage);
});

/**
 * Initialize add task form with all components
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function initializeAddTaskForm(container = document) {
    activeContainer = container;
    initializePriorityButtons(container);
    initializeDateInput(container);
    initializeDropdowns(container);
    initializeSubtasks(container);
    initializeFormButtons(container);
}

/**
 * Initialize form button event listeners
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function initializeFormButtons(container = document) {
    attachButtonListeners(container);
    attachInputListeners(container);
    attachCategoryListener(container);
}

/**
 * Attach event listeners to form buttons
 * Searches in container first, then falls back to document for buttons outside container
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function attachButtonListeners(container = document) {
    const createButton = container.querySelector('.btn-create') || document.querySelector('.btn-create');
    const clearButton = container.querySelector('.btn-clear') || document.querySelector('.btn-clear');

    if (createButton) {
        createButton.addEventListener('click', () => handleCreateTask(container));
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => handleClearForm(container));
    }
}

/**
 * Attach input event listeners to clear errors on typing
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function attachInputListeners(container = document) {
    const titleInput = container.querySelector('.input-title');
    if (titleInput) {
        titleInput.addEventListener('input', () => clearFieldError('title', container));
    }

    const dueDateInput = container.querySelector('.due-date-input');
    if (dueDateInput) {
        dueDateInput.addEventListener('input', () => clearFieldError('dueDate', container));
    }
}

/**
 * Attach listener to clear category error on selection
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function attachCategoryListener(container = document) {
    container.addEventListener('click', (event) => {
        if (event.target.closest('.category-option')) {
            clearFieldError('category', container);
        }
    });
}

/**
 * Shows error messages under the respective fields
 * @param {{title: string|null, dueDate: string|null, category: string|null}} errors - Field-specific error messages
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function showErrors(errors, container = document) {
    clearAllFieldErrors(container);
    if (errors.title) {
        showFieldError('title', errors.title, container);
    }

    if (errors.dueDate) {
        showFieldError('dueDate', errors.dueDate, container);
    }

    if (errors.category) {
        showFieldError('category', errors.category, container);
    }
}

/**
 * Handles task creation and validation
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {Promise<boolean>}
 * Returns true if task was created successfully, false otherwise
 */
export async function handleCreateTask(container = document) {
    const validation = validateTaskForm(container);

    if (!validation.isValid) {
        showErrors(validation.errors, container);
        return false;
    }

    return await createAndRedirect(container);
}

/**
 * Handles task creation without redirect (for board aside dialog)
 * @param {HTMLElement} container - The container element to scope queries
 * @param {string} [targetCategory='to-do'] - The target category/column for the new task
 * @returns {Promise<boolean>}
 * Returns true if task was created successfully, false otherwise
 */
export async function handleCreateTaskFromBoard(container = document, targetCategory = 'to-do') {
    const validation = validateTaskForm(container);

    if (!validation.isValid) {
        showErrors(validation.errors, container);
        return false;
    }

    try {
        const taskData = collectTaskData(container, targetCategory);
        await createTask(taskData);
        return true;
    } catch (error) {
        handleCreateTaskError();
        return false;
    }
}

/**
 * Creates task and redirects to board page.
 * Uses urlTargetCategory from URL parameters (for mobile redirect from board).
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {Promise<boolean>}
 * Returns true if task was created successfully, false otherwise
 */
async function createAndRedirect(container = document) {
    try {
        const taskData = collectTaskData(container, urlTargetCategory);
        await createTask(taskData);
        showSuccessBanner();
        redirectToBoard();
        return true;
    } catch (error) {
        handleCreateTaskError();
        return false;
    }
}

/**
 * Handles errors during task creation
 * @returns {void}
 */
function handleCreateTaskError() {
    showErrorBanner('Error creating task. Please try again.');
}

/**
 * Redirects to board page after short delay
 * @returns {void}
 */
function redirectToBoard() {
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 1000);
}

/**
 * Clears the entire form
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function handleClearForm(container = document) {
    clearFormInputs(container);
    resetPriorityToMedium(container);
    clearContactSelections(container);
    clearCategorySelection(container);
    clearSubtasksSection(container);
}