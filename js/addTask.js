import {initializeSubtasks} from "./subtaskManager.js";
import {initializePriorityButtons} from "./priorityManager.js";
import {initializeDateInput} from "./dateInputManager.js";
import {initializeDropdowns} from "./dropdownManager.js";
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
 * @returns {void}
 */
function initAddTaskPage() {
    urlTargetCategory = getCategoryFromUrl();
    let container = document.getElementsByClassName("add-task-form-container")[0];
    activeContainer = container;
    initializePriorityButtons(container);
    initializeDateInput(container);
    initializeDropdowns(container);
    initializeSubtasks(container);
    initializeFormButtons(container);
}

window.init = initAddTaskPage;

/**
 * Initialize form button event listeners
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function initializeFormButtons(container) {
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
function attachButtonListeners(container) {
    const createButton = container.querySelector('.btn-create') || document.querySelector('.btn-create');
    const clearButton = container.querySelector('.btn-clear') || document.querySelector('.btn-clear');

    if (!createButton || !clearButton) return;
    createButton.addEventListener('click', () => handleCreateTask(container));
    clearButton.addEventListener('click', () => handleClearForm(container));
}

/**
 * Attach input event listeners to clear errors on typing
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function attachInputListeners(container) {
    const titleInput = container.querySelector('.input-title');
    const dueDateInput = container.querySelector('.due-date-input');
    if (!titleInput || !dueDateInput) return;
    titleInput.addEventListener('input', () => clearFieldError('title', container));
    dueDateInput.addEventListener('input', () => clearFieldError('dueDate', container));
}

/**
 * Attach listener to clear category error on selection
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function attachCategoryListener(container) {
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
function showErrors(errors, container) {
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
export async function handleCreateTask(container) {
    const validation = validateTaskForm(container);
    if (validation.isValid) return await createAndRedirect(container);

    showErrors(validation.errors, container);
    return false;
}

/**
 * Handles task creation without redirect (for board aside dialog)
 * @param {HTMLElement|Document} container - The container element to scope queries
 * @param {string} [targetCategory='to-do'] - The target category/column for the new task
 * @returns {Promise<boolean>}
 * Returns true if task was created successfully, false otherwise
 */
export async function handleCreateTaskFromBoard(container, targetCategory = 'to-do') {
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
 * Creates task and redirects to board page
 * Uses urlTargetCategory from URL parameters (for mobile redirect from board)
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {Promise<boolean>}
 * Returns true if task was created successfully, false otherwise
 */
async function createAndRedirect(container) {
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
function handleCreateTaskError() { showErrorBanner('Error creating task. Please try again.'); }

/**
 * Redirects to board page after short delay (to allow success banner to be seen)
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
function handleClearForm(container) {
    clearFormInputs(container);
    resetPriorityToMedium(container);
    clearContactSelections(container);
    clearCategorySelection(container);
    clearSubtasksSection(container);
}