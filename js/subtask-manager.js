/**
 * Subtask Management Functions
 * Handles all subtask-related operations
 */

import { createSubtaskHTML, createEditActionsHTML, createNormalActionsHTML } from "./template.js";

/**
 * Toggles visibility of subtask input icons based on input content
 */
export function toggleSubtaskIcons() {
    console.log("🔵 toggleSubtaskIcons called");
    const input = document.querySelector(".subtask-input");
    const icons = document.querySelector(".subtask-icons");

    if (!input) {
        console.error("❌ Subtask input element not found!");
        return;
    }
    if (!icons) {
        console.error("❌ Subtask icons element not found!");
        return;
    }

    console.log("Input length:", input.value.trim().length);
    if (input.value.trim().length > 0) {
        icons.classList.add("visible");
        console.log("✅ Icons made visible");
    } else {
        icons.classList.remove("visible");
        console.log("✅ Icons hidden");
    }
}

/**
 * Clears the subtask input field and hides icons
 */
export function clearSubtaskInput() {
    console.log("🔵 clearSubtaskInput called - BUTTON WORKS!");
    const input = document.querySelector(".subtask-input");
    const icons = document.querySelector(".subtask-icons");

    if (!input || !icons) {
        console.error("❌ Required elements not found:", { input: !!input, icons: !!icons });
        return;
    }

    console.log("Before clear, input length:", input.value.trim().length);
    input.value = "";
    icons.classList.remove("visible");
    input.focus();
    console.log("✅ Subtask input cleared");
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
    console.log("🔵 addNewSubtask called - BUTTON WORKS!");
    const input = document.querySelector(".subtask-input");
    const list = document.getElementById("subtaskList");

    if (!input) {
        console.error("❌ Subtask input not found!");
        return;
    }
    if (!list) {
        console.error("❌ Subtask list not found!");
        return;
    }

    const text = input.value.trim();
    if (!text) {
        console.log("⚠️ Empty input, not adding subtask");
        return;
    }

    const listItem = document.createElement("li");
    listItem.className = "subtask-item";
    const escapedText = escapeHtml(text);
    listItem.innerHTML = createSubtaskHTML(escapedText);

    list.appendChild(listItem);
    console.log("✅ Subtask added:", text);
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
    console.log("🔵 deleteSubtask called", button);
    const listItem = button.closest(".subtask-item");
    if (!listItem) {
        console.error("❌ Could not find parent subtask-item!");
        return;
    }
    const text = listItem.querySelector('.subtask-text')?.textContent || '';
    listItem.remove();
    console.log("✅ Subtask deleted:", text);
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
    console.log("🔵 cancelEdit called", button);
    const listItem = button.closest(".subtask-item");
    if (!listItem) {
        console.error("❌ Could not find parent subtask-item!");
        return;
    }

    const input = listItem.querySelector(".subtask-edit-input");
    if (!input) {
        console.error("❌ Could not find edit input!");
        return;
    }

    const originalText = input.getAttribute("data-original");
    console.log("↩️ Restoring original text:", originalText);
    exitEditMode(listItem, input, originalText);
    console.log("✅ Edit cancelled");
}

/**
 * Saves edited text
 * @param {HTMLElement} button - The save button element
 */
export function saveEdit(button) {
    console.log("🔵 saveEdit called", button);
    const listItem = button.closest(".subtask-item");
    if (!listItem) {
        console.error("❌ Could not find parent subtask-item!");
        return;
    }

    const input = listItem.querySelector(".subtask-edit-input");
    if (!input) {
        console.error("❌ Could not find edit input!");
        return;
    }

    const newText = input.value.trim();
    console.log("💾 Saving text:", newText);

    if (newText) {
        exitEditMode(listItem, input, newText);
        console.log("✅ Edit saved");
    } else {
        listItem.remove();
        console.log("✅ Empty subtask removed");
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
    if (!subtaskList) {
        console.error("❌ subtaskList element not found! Event delegation will not work.");
        return;
    }

    console.log("🟢 Initializing subtask event delegation");
    subtaskList.addEventListener('click', (e) => {
        console.log("🖱️ Click detected in subtaskList", e.target);

        if (e.target.closest('.subtask-delete')) {
            console.log("Delete button clicked");
            deleteSubtask(e.target);
        }
        if (e.target.closest('.subtask-edit')) {
            console.log("Edit button clicked");
            startEditingSubtask(e.target);
        }
        if (e.target.closest('.save-edit')) {
            console.log("Save button clicked");
            saveEdit(e.target);
        }
        if (e.target.closest('.cancel-edit')) {
            console.log("Cancel button clicked");
            cancelEdit(e.target);
        }
    });
    console.log("✅ Subtask event delegation initialized");
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
