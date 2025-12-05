import {
    toggleSubtaskIcons,
    clearSubtaskInput,
    handleSubtaskEnter,
    addNewSubtask,
    handleEditEnter,
    initializeSubtasks,
    getSubtasks
} from "./subtask-manager.js";

import {
    selectPriority,
    initializePriorityButtons,
    getSelectedPriority
} from "./priority-manager.js";

import {
    initializeDateInput,
    isValidDate
} from "./date-input-manager.js";

import {
    toggleDropdown,
    filterOptions,
    selectContact,
    selectCategory,
    initializeDropdowns,
    getSelectedContacts,
    getSelectedCategory,
    clearSelectedContacts,
    clearSelectedCategory
} from "./dropdown-manager.js";

import { createTask } from "./database.js";


/**
 * Export functions to window for HTML onclick handlers
 * @return {void}
 */
window.toggleSubtaskIcons = toggleSubtaskIcons;
window.clearSubtaskInput = clearSubtaskInput;
window.handleSubtaskEnter = handleSubtaskEnter;
window.addNewSubtask = addNewSubtask;
window.handleEditEnter = handleEditEnter;
window.selectPriority = selectPriority;
window.initializePriorityButtons = initializePriorityButtons;
window.toggleDropdown = toggleDropdown;
window.filterOptions = filterOptions;
window.selectContact = selectContact;
window.selectCategory = selectCategory;

/**
 * Initialize all components when DOM is fully loaded
 * Sets up priority buttons, date input, dropdowns, and subtasks
 * @return {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    initializePriorityButtons();
    initializeDateInput();
    initializeDropdowns();
    initializeSubtasks();
    initializeFormButtons();
});

/**
 * Initialize form button event listeners
 * @return {void}
 */
function initializeFormButtons() {
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
 * Validates the task form
 * @returns {Object} Object with isValid flag and errors array
 */
function validateTaskForm() {
    const errors = [];

    const title = document.querySelector('.task-title')?.value?.trim();
    if (!title) {
        errors.push('Title is required');
    }

    const dueDate = document.getElementById('dueDate')?.value;
    if (!dueDate || !isValidDate(dueDate)) {
        errors.push('Valid due date is required (dd/mm/yyyy)');
    }

    const category = getSelectedCategory();
    if (!category) {
        errors.push('Category is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Shows error messages to the user
 * @param {Array} errors - Array of error messages
 * @return {void}
 */
function showErrors(errors) {
    // For now, use alert. Can be replaced with a better UI notification later
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
}

/**
 * Shows success message to the user
 * @return {void}
 */
function showSuccess() {
    // For now, use alert. Can be replaced with a better UI notification later
    alert('Task created successfully!');
}

/**
 * Handles task creation
 * @return {Promise<void>}
 */
async function handleCreateTask() {
    const validation = validateTaskForm();

    if (!validation.isValid) {
        showErrors(validation.errors);
        return;
    }

    try {
        const taskData = collectTaskData();
        await createTask(taskData);
        showSuccess();
        handleClearForm();

        // Optionally redirect to board page
        // window.location.href = 'board.html';
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Error creating task. Please try again.');
    }
}

/**
 * Collects all task data from the form
 * @returns {Object} Task data object
 */
function collectTaskData() {
    const title = document.querySelector('.task-title')?.value?.trim();
    const text = document.querySelector('.task-description')?.value?.trim();
    const dueDate = document.getElementById('dueDate')?.value;
    const priority = getSelectedPriority();
    const category = getSelectedCategory();
    const assignedContacts = getSelectedContacts();
    const subtasks = getSubtasks();

    // Convert dd/mm/yyyy to ISO format for storage
    const [day, month, year] = dueDate.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    return {
        title,
        text, // Description field maps to "text"
        dueDate: isoDate,
        priority,
        task: category.name, // Category name (e.g., "Technical Task" or "User Story")
        category: 'to-do', // Status: new tasks start as "to-do"
        member: assignedContacts.map(c => c.id), // Assigned contacts map to "member"
        subtasks: subtasks.map(s => s.text) // Subtasks as array of strings
    };
}

/**
 * Clears the entire form
 * @return {void}
 */
function handleClearForm() {
    // Clear title
    const titleInput = document.querySelector('.task-title');
    if (titleInput) titleInput.value = '';

    // Clear description
    const descriptionInput = document.querySelector('.task-description');
    if (descriptionInput) descriptionInput.value = '';

    // Clear due date
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) dueDateInput.value = '';

    // Reset priority to medium
    const mediumButton = document.querySelector('.priority-btn.medium');
    if (mediumButton) selectPriority(mediumButton);

    // Clear selected contacts
    clearSelectedContacts();
    const dropzone = document.querySelector('.dropzone');
    if (dropzone) dropzone.innerHTML = '';

    // Clear contact checkboxes
    document.querySelectorAll('.contact-option').forEach(option => {
        option.classList.remove('selected');
        const checkbox = option.querySelector('.contact-checkbox');
        if (checkbox) checkbox.classList.remove('checked');
    });

    // Clear selected category
    clearSelectedCategory();
    const categoryDisplay = document.getElementById('categoryDisplay');
    if (categoryDisplay) categoryDisplay.textContent = 'Select task category';
    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Clear subtasks
    const subtaskList = document.getElementById('subtaskList');
    if (subtaskList) subtaskList.innerHTML = '';

    // Clear subtask input
    clearSubtaskInput();
}
