/**
 * Subtask Management Functions
 * Handles all subtask-related operations
 */

import {createSubtaskHTML, createEditActionsHTML, createNormalActionsHTML} from "./template.js";

/**
 * Toggles visibility of subtask input icons based on input content
 */
export function toggleSubtaskIcons() {
    const input = document.querySelector(".subtask-input");
    const icons = document.querySelector(".subtask-icons");

    if (!input || !icons) return;

    if (input.value.trim().length > 0) {
        icons.classList.add("visible");
    } else {
        icons.classList.remove("visible");
    }
}

/**
 * Clears the subtask input field and hides icons
 */
export function clearSubtaskInput() {
    const input = document.querySelector(".subtask-input");
    const icons = document.querySelector(".subtask-icons");

    if (!input || !icons) return;

    input.value = "";
    icons.classList.remove("visible");
    input.focus();
}

/**
 * Handles Enter key press in input field
 * @param {KeyboardEvent} event - The keyboard event
 */
export function handleSubtaskEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addNewSubtask();
    }
}

/**
 * Adds a new subtask to the list
 */
export function addNewSubtask() {
    const input = document.querySelector(".subtask-input");
    const list = document.getElementById("subtaskList");

    if (!input || !list) return;

    const text = input.value.trim();
    if (!text) return;

    const listItem = document.createElement("li");
    listItem.className = "subtask-item";
    const escapedText = escapeHtml(text);
    listItem.innerHTML = createSubtaskHTML(escapedText);

    list.appendChild(listItem);
    clearSubtaskInput();
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
    const textSpan = listItem.querySelector(".subtask-text");
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
 * Initialize subtask event listeners
 */
export function initializeSubtasks() {
    const subtaskList = document.getElementById('subtaskList');
    if (!subtaskList) return;

    subtaskList.addEventListener('click', (e) => {
        if (e.target.closest('.subtask-delete')) {
            deleteSubtask(e.target);
        }
        if (e.target.closest('.subtask-edit')) {
            startEditingSubtask(e.target);
        }
        if (e.target.closest('.save-edit')) {
            saveEdit(e.target);
        }
        if (e.target.closest('.cancel-edit')) {
            cancelEdit(e.target);
        }
    });
}

/**
 * Gets all current subtasks
 * @returns {Array} Array of subtask objects with text and completed status
 */
export function getSubtasks() {
    const subtaskList = document.getElementById('subtaskList');
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

