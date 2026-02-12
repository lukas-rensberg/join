/**
 * Subtask Management Functions
 * Handles all subtask-related operations with scoped container support
 */

import {createSubtaskHTML, createEditActionsHTML, createNormalActionsHTML} from "./template.js";

let activeContainer = null;
const initializedContainers = new WeakSet();

/**
 * Resets the initialization state for a container, allowing re-initialization
 * @param {HTMLElement} container - The container to reset
 */
export function resetSubtaskInitialization(container) {
    if (container && initializedContainers.has(container)) {
        initializedContainers.delete(container);
    }
}

/**
 * Toggles visibility of subtask input icons based on input content
 * @param {HTMLElement} container - The container element to scope queries
 */
export function toggleSubtaskIcons(container) {
    const input = container.querySelector(".subtask-input");
    const icons = container.querySelector(".subtask-icons");

    if (!input || !icons) return;

    if (input.value.trim().length > 0) {
        icons.classList.add("visible");
    } else {
        icons.classList.remove("visible");
    }
}

/**
 * Clears the subtask input field and hides icons
 * @param {HTMLElement} container - The container element to scope queries
 */
export function clearSubtaskInput(container) {
    const input = container.querySelector(".subtask-input");
    const icons = container.querySelector(".subtask-icons");

    if (!input || !icons) return;

    input.value = "";
    icons.classList.remove("visible");
    input.focus();
}

/**
 * Handles Enter key press in input field
 * @param {KeyboardEvent|Event} event - The keyboard event
 * @param {HTMLElement} container - The container element to scope queries
 */
export function handleSubtaskEnter(event, container) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask(container);
    }
}

/**
 * Adds a new subtask to the list
 * @param {HTMLElement} container - The container element to scope queries
 */
export function addNewSubtask(container) {
    const input = container.querySelector(".subtask-input");
    const list = container.querySelector(".subtask-list");

    if (!input || !list) return;

    const text = input.value.trim();
    if (!text) return;

    const listItem = document.createElement("li");
    listItem.className = "subtask-item";
    const escapedText = escapeHtml(text);
    listItem.innerHTML = createSubtaskHTML(escapedText);

    list.appendChild(listItem);
    clearSubtaskInput(container);
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Deletes a subtask from the list
 * @param {HTMLElement} button - The delete button element
 */
export function deleteSubtask(button) {
    const listItem = button.closest(".subtask-item");
    if (!listItem) return;
    listItem.remove();
}

/**
 * Creates an edit input element
 * @param {string} text - The current text value
 * @returns {HTMLInputElement} The input element
 */
function createEditInput(text) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "subtask-edit-input";
    input.value = text;
    input.setAttribute("data-original", text);
    input.addEventListener("keypress", (event) => handleEditEnter(event, input));
    return input;
}

/**
 * Starts editing mode for a subtask
 * @param {HTMLElement} button - The edit button element
 */
export function startEditingSubtask(button) {
    const listItem = button.closest(".subtask-item");
    if (!listItem) return;

    const textSpan = listItem.querySelector(".subtask-text");
    if (!textSpan) return;

    const currentText = textSpan.textContent;

    listItem.classList.add("subtask-item-editing");
    const input = createEditInput(currentText);
    textSpan.replaceWith(input);
    input.focus();

    const actions = listItem.querySelector(".subtask-actions");
    actions.innerHTML = createEditActionsHTML();
}

/**
 * Handles Enter key press during editing
 * @param {KeyboardEvent} event - The keyboard event
 * @param {HTMLInputElement} input - The input field element
 */
export function handleEditEnter(event, input) {
    if (event.key === "Enter") {
        event.preventDefault();
        const saveBtn = input.closest(".subtask-item").querySelector(".save-edit");
        if (saveBtn) {
            saveEdit(saveBtn);
        }
    }
}

/**
 * Cancels editing and restores original text
 * @param {HTMLElement} button - The cancel button element
 */
export function cancelEdit(button) {
    const listItem = button.closest(".subtask-item");
    if (!listItem) return;

    const input = listItem.querySelector(".subtask-edit-input");
    if (!input) return;

    const originalText = input.getAttribute("data-original");
    exitEditMode(listItem, input, originalText);
}

/**
 * Saves edited text
 * @param {HTMLElement} button - The save button element
 */
export function saveEdit(button) {
    const listItem = button.closest(".subtask-item");
    if (!listItem) return;

    const input = listItem.querySelector(".subtask-edit-input");
    if (!input) return;

    const newText = input.value.trim();

    if (newText) {
        exitEditMode(listItem, input, newText);
    } else {
        listItem.remove();
    }
}

/**
 * Exits edit mode and restores normal view
 * @param {HTMLElement} listItem - The list item element
 * @param {HTMLInputElement} input - The input field element
 * @param {string} text - The text to display
 */
function exitEditMode(listItem, input, text) {
    listItem.classList.remove("subtask-item-editing");

    const span = document.createElement("span");
    span.className = "subtask-text";
    span.textContent = text;
    input.replaceWith(span);

    const actions = listItem.querySelector(".subtask-actions");
    actions.innerHTML = createNormalActionsHTML();
}

/**
 * Setup event delegation for subtasks
 * @param {HTMLElement} container - The container element to scope events
 */
function setupSubtaskEventDelegation(container) {
    container.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.subtask-delete');
        if (deleteBtn) {
            deleteSubtask(deleteBtn);
            return;
        }

        const editBtn = event.target.closest('.subtask-edit');
        if (editBtn) {
            startEditingSubtask(editBtn);
            return;
        }

        const saveBtn = event.target.closest('.save-edit');
        if (saveBtn) {
            saveEdit(saveBtn);
            return;
        }

        const cancelBtn = event.target.closest('.cancel-edit');
        if (cancelBtn) {
            cancelEdit(cancelBtn);
            return;
        }

        if (event.target.closest('.icon-cancel')) {
            clearSubtaskInput(container);
            return;
        }

        if (event.target.closest('.icon-confirm')) addNewSubtask(container);
    });

    const subtaskInput = container.querySelector('.subtask-input');
    if (subtaskInput) {
        subtaskInput.addEventListener('input', () => toggleSubtaskIcons(container));
        subtaskInput.addEventListener('keypress', (event) => handleSubtaskEnter(event, container));
    }
}

/**
 * Initialize subtask event listeners
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 */
export function initializeSubtasks(container) {
    if (initializedContainers.has(container)) return;
    initializedContainers.add(container);

    activeContainer = container;
    setupSubtaskEventDelegation(container);
}

/**
 * Gets all current subtasks
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {Array} Array of subtask objects with text and completed status
 */
export function getSubtasks(container) {
    const subtaskList = container.querySelector('.subtask-list');
    if (!subtaskList) return [];

    const subtaskItems = subtaskList.querySelectorAll('.subtask-item');
    const subtasks = [];

    subtaskItems.forEach((item) => {
        const textElement = item.querySelector('.subtask-text');
        if (textElement) {
            subtasks.push({
                text: textElement.textContent.trim(),
                completed: false
            });
        }
    });
    return subtasks;
}

/**
 * Populates the subtask list with existing subtasks from a task
 * All subtasks are rendered as not-done (changes reset the done status)
 * TODO: Add option to preserve completion status when editing tasks
 * @param {string[]} subtasks - Array of pending subtask texts
 * @param {string[]} subtasksDone - Array of completed subtask texts
 * @param {HTMLElement} container - The container element to scope queries
 */
export function populateSubtasks(subtasks = [], subtasksDone = [], container) {
    const subtaskList = container.querySelector('.subtask-list');
    if (!subtaskList) return;

    subtaskList.innerHTML = '';

    const allSubtasks = [...subtasks, ...subtasksDone];

    allSubtasks.forEach(subtaskText => {
        if (!subtaskText) return;

        const listItem = document.createElement('li');
        listItem.className = 'subtask-item';
        listItem.innerHTML = createSubtaskHTML(subtaskText);
        subtaskList.appendChild(listItem);
    });
}
