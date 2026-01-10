import {
    toggleSubtaskIcons,
    clearSubtaskInput,
    handleSubtaskEnter,
    addNewSubtask,
    handleEditEnter,
    initializeSubtasks,
    deleteSubtask,
    startEditingSubtask,
    saveEdit,
    cancelEdit
} from "./subtask-manager.js";

import {
    selectPriority,
    initializePriorityButtons
} from "./priority-manager.js";

import { initializeDateInput } from "./date-input-manager.js";

import {
    toggleDropdown,
    filterOptions,
    selectContact,
    selectCategory,
    initializeDropdowns
} from "./dropdown-manager.js";

import { createTask } from "./database.js";

import {
    showFieldError,
    clearFieldError,
    clearAllFieldErrors,
    showSuccessBanner,
    showErrorBanner
} from "./error-handler.js";

import { validateTaskForm } from "./form-validation.js";

import { collectTaskData } from "./task-data-collector.js";

import {
    clearFormInputs,
    resetPriorityToMedium,
    clearContactSelections,
    clearCategorySelection,
    clearSubtasksSection
} from "./form-utils.js";

import { getTemplateAddTask } from "./template.js";


/**
 * Export functions to window for HTML onclick handlers
 * @returns {void}
 */
window.toggleSubtaskIcons = toggleSubtaskIcons;
window.clearSubtaskInput = clearSubtaskInput;
window.handleSubtaskEnter = handleSubtaskEnter;
window.addNewSubtask = addNewSubtask;
window.handleEditEnter = handleEditEnter;
window.deleteSubtask = deleteSubtask;
window.startEditingSubtask = startEditingSubtask;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;
window.selectPriority = selectPriority;
window.initializePriorityButtons = initializePriorityButtons;
window.toggleDropdown = toggleDropdown;
window.filterOptions = filterOptions;
window.selectContact = selectContact;
window.selectCategory = selectCategory;

/**
 * Initialize all components when DOM is fully loaded
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    createAddTask();

    initializePriorityButtons();
    initializeDateInput();
    initializeDropdowns();
    initializeSubtasks();
    initializeFormButtons();
});


/**
 * Initialize form button event listeners
 * @returns {void}
 */
function initializeFormButtons() {
    attachButtonListeners();
    attachInputListeners();
    attachCategoryListener();
}


/**
 * Attach event listeners to form buttons
 * @returns {void}
 */
function attachButtonListeners() {
    const createButton = document.querySelector('.btn-create');
    const clearButton = document.querySelector('.btn-clear');

    if (createButton) {
        createButton.addEventListener('click', handleCreateTask);
    }

    if (clearButton) {
        clearButton.addEventListener('click', handleClearForm);
    }
}




/**
 * Attach input event listeners to clear errors on typing
 * @returns {void}
 */
function attachInputListeners() {
    const titleInput = document.querySelector('.input-title');
    if (titleInput) {
        titleInput.addEventListener('input', () => clearFieldError('title'));
    }

    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        dueDateInput.addEventListener('input', () => clearFieldError('dueDate'));
    }
}

/**
 * Attach listener to clear category error on selection
 * @returns {void}
 */
function attachCategoryListener() {
    const originalSelectCategory = window.selectCategory;
    window.selectCategory = function (categoryId) {
        clearFieldError('category');
        originalSelectCategory(categoryId);
    };
}


/**
 * Shows error messages under the respective fields
 * @param {{title: string|null, dueDate: string|null, category: string|null}} errors - Field-specific error messages
 * @returns {void}
 */
function showErrors(errors) {
    clearAllFieldErrors();

    if (errors.title) {
        showFieldError('title', errors.title);
    }

    if (errors.dueDate) {
        showFieldError('dueDate', errors.dueDate);
    }

    if (errors.category) {
        showFieldError('category', errors.category);
    }
}

/**
 * Handles task creation and validation
 * @returns {Promise<void>}
 */
async function handleCreateTask() {
    const validation = validateTaskForm();

    if (!validation.isValid) {
        showErrors(validation.errors);
        return;
    }

    await createAndRedirect();
}

/**
 * Creates task and redirects to board page
 * @returns {Promise<void>}
 */
async function createAndRedirect() {
    try {
        const taskData = collectTaskData();
        await createTask(taskData);
        showSuccessBanner('Task created successfully!');
        redirectToBoard();
    } catch (error) {
        handleCreateTaskError();
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
    }, 500);
}


/**
 * Clears the entire form
 * @returns {void}
 */
function handleClearForm() {
    clearFormInputs();
    resetPriorityToMedium();
    clearContactSelections();
    clearCategorySelection();
    clearSubtasksSection();
}

/**
 * Creates and renders the add task form in the DOM.
 * @returns {void}
 */
function createAddTask() {
    const container = document.querySelector(".add-task-form-container");
    container.innerHTML += getTemplateAddTask();
}