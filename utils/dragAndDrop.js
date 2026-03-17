import {isDesktop} from "./mediaQuerySwitch.js";
import {tasks} from "../js/board.js";
import {saveTask} from "./taskDialog.js";

export let dragState = {
    isDragging: false,
    taskId: null,
    sourceSection: null,
    currentSection: null
};

/**
 * Resets the drag state to default values.
 */
function resetDragState() {
    dragState = {
        isDragging: false,
        taskId: null,
        sourceSection: null,
        currentSection: null
    };
}

/**
 * Marks the task as being dragged and initializes drag state.
 * @param {string} id - Task id of the dragged element.
 */
export function startDragging(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (!taskElement || !isDesktop()) return;

    const task = tasks.find(t => t.id === id);

    dragState.isDragging = true;
    dragState.taskId = id;
    dragState.sourceSection = task ? task.category : null;
    dragState.currentSection = null;

    taskElement.classList.add("is-dragging");
}

/**
 * Allows dropping by preventing the default browser dragover behavior.
 * @param {DragEvent} event - Dragover event object.
 */
export function allowDrop(event) {
    event.preventDefault();
}

/**
 * Handles dragover events for board columns.
 * Only updates DOM when section actually changes.
 * @param {Event} event - The dragover event object.
 * @param {string} section - The id of the column being dragged over.
 */
export function handleDragOver(event, section) {
    event.preventDefault();

    if (!dragState.isDragging) return;
    if (dragState.currentSection === section) return;
    if (dragState.currentSection) removeDropHighlight(dragState.currentSection);

    dragState.currentSection = section;
    addDropHighlight(section);
}

/**
 * Adds visual highlight to a drop target section.
 * @param {string} sectionId - The section to highlight.
 */
function addDropHighlight(sectionId) {
    const container = document.getElementById(sectionId);
    if (!container) return;

    container.classList.add("task-card-container-dragover");

    const noTasksElem = container.querySelector(".no-tasks");
    if (noTasksElem) noTasksElem.style.display = "none";

    if (!container.querySelector(".empty-card")) {
        container.insertAdjacentHTML("beforeend", `<div class="empty-card"></div>`);
    }
}

/**
 * Removes visual highlight from a drop target section.
 * @param {string} sectionId - The section to remove highlight from.
 */
function removeDropHighlight(sectionId) {
    const container = document.getElementById(sectionId);
    if (!container) return;

    container.classList.remove("task-card-container-dragover");

    const emptyCard = container.querySelector(".empty-card");
    if (emptyCard) emptyCard.remove();

    const noTasksElem = container.querySelector(".no-tasks");
    if (noTasksElem) noTasksElem.style.display = "flex";
}

/**
 * Handles the dragend event - cleans up all visual feedback.
 */
export function handleDragEnd() {
    if (dragState.taskId) {
        const taskElement = document.querySelector(`[data-task-id="${dragState.taskId}"]`);
        if (taskElement) taskElement.classList.remove("is-dragging");
    }

    if (dragState.currentSection) {
        removeDropHighlight(dragState.currentSection);
    }
    resetDragState();
}

/**
 * Moves the currently dragged task to a new category and persists the change.
 * @param {string} category - Target category id.
 */
export async function moveTo(category) {
    if (!dragState.taskId) return;

    const taskToUpdate = tasks.find(task => task.id === dragState.taskId);

    if (taskToUpdate) {
        taskToUpdate.category = category;
        await saveTask(taskToUpdate);
    }
    removeDropHighlight(category);
}

/**
 * Moves a task to a new category using the swap menu.
 * @param {Event} event - The click event object.
 * @param {string} taskId - The task id to move.
 * @param {string} category - The target category.
 * @returns {void}
 */
export function moveTaskTo(event, taskId, category) {
    event.stopPropagation();

    dragState.taskId = taskId;
    moveTo(category);

    closeAllSwapMenus();
}

/**
 * Closes all open swap dropdown menus.
 * @returns {void}
 */
export function closeAllSwapMenus() {
    const allDropdowns = document.querySelectorAll('.card-swap-dropdown');
    allDropdowns.forEach(dropdown => dropdown.classList.remove('open'));
}

/**
 * Toggles the swap dropdown menu for a specific task card.
 * Hides the current category option and shows all others.
 * @param {Event} event - The click event object.
 * @param {string} taskId - The task id.
 * @param {string} currentCategory - The current category of the task.
 * @returns {void}
 */
export function toggleSwapMenu(event, taskId, currentCategory) {
    event.stopPropagation();

    const dropdown = document.getElementById(`swap-dropdown-${taskId}`);
    if (!dropdown) return;

    closeOtherDropdowns(dropdown);
    filterDropdownItems(dropdown, currentCategory);

    dropdown.classList.toggle('open');
}

/**
 * Closes all swap dropdown menus except the specified one.
 * @param {HTMLElement} excludeDropdown - The dropdown to keep open.
 */
function closeOtherDropdowns(excludeDropdown) {
    const allDropdowns = document.querySelectorAll('.card-swap-dropdown');
    allDropdowns.forEach(openDropdown => {
        if (openDropdown !== excludeDropdown) openDropdown.classList.remove('open');
    });
}

/**
 * Filters dropdown items to hide the current category and show all others.
 * @param {HTMLElement} dropdown - The dropdown element containing the items.
 * @param {string} currentCategory - The current category to hide.
 */
function filterDropdownItems(dropdown, currentCategory) {
    const items = dropdown.querySelectorAll('.move-to-do, .move-to-review');
    items.forEach(item => {
        item.style.display = item.dataset.category === currentCategory ? 'none' : 'flex';
    });
}