import {database, loadTasks} from "./database.js";

import {onValue, ref} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import { getNoTaskTemplate, getTemplateMarkedUser, getTemplateRemainingMembers, getTemplateTaskCard } from "./template.js";

import {desktopMediaQuery, handleBoardMediaQueryChange} from "../utils/mediaQuerySwitch.js";

import { allowDrop, closeAllSwapMenus, handleDragEnd, handleDragOver, moveTo, startDragging, toggleSwapMenu } from "../utils/dragAndDrop.js";

import {openAddTaskAside} from "../utils/addTaskAside.js";
import {closeDialog, deleteTaskButton, editTaskInDialog, openDialog, saveTask} from "../utils/taskDialog.js";

let findTask = document.getElementById("search-task");


export let tasks = [];
export let contacts = [];
export let currentDraggedElement = null;

/**
 * Filters tasks by search input from the search field.
 * Searches for matches in task titles (case-insensitive).
 * Updates the board display with filtered results or resets to show all tasks if search is empty.
 * @returns {void}
 */
function filterTasksBySearch() {
    const searchInput = findTask.value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchInput) ||
        task.text.toLowerCase().includes(searchInput));
    if (!searchInput) return updateHTML();

    renderFilteredTasks(filteredTasks);
}

/**
 * Renders filtered tasks organized by category on the board.
 * Displays filtered tasks in their respective columns with progress bars and member avatars.
 * Shows empty state message if no tasks match the filter for a category.
 * @param {Array<Object>} filteredTasks - Array of task objects to render.
 * @returns {void}
 */
function renderFilteredTasks(filteredTasks) {
    const categories = ['to-do', 'in-progress', 'await-feedback', 'done'];

    categories.forEach(category => {
        const categoryTasks = filteredTasks.filter(task => task.category === category);
        const containerRef = document.getElementById(category);
        containerRef.innerHTML = "";

        if (categoryTasks.length === 0) return containerRef.innerHTML = getNoTaskTemplate(category);

        categoryTasks.forEach(task => {
            const subtasks = task.subtasks || [];
            const subtasksDone = task.subtasks_done || [];
            const totalSubtasks = subtasks.length + subtasksDone.length;
            const progressWidth = totalSubtasks > 0 ? (subtasksDone.length / totalSubtasks) * 100 : 0;
            containerRef.innerHTML += getTemplateTaskCard(task, subtasksDone, totalSubtasks, progressWidth);
            initMarkedUsers(task);
            hideEmptySubtasks(task);
        });
    });
}


/**
 * Loads contacts from Firebase database and stores them in the contacts array.
 * Sets up a real-time listener that updates contacts when changes occur in the database.
 * @returns {void}
 */
export function loadContacts() {
    const contactsRef = ref(database, 'contacts');
    onValue(contactsRef, (snapshot) => {
        if (snapshot.exists()) {
            contacts = Object.values(snapshot.val());
        }
    });
}

/**
 * Formats a date string for display in DD/MM/YYYY format.
 * Returns "No due date" if the date string is empty or undefined.
 * @param {string} dateString - Date in YYYY-MM-DD format.
 * @returns {string} Formatted date string in DD/MM/YYYY format or "No due date".
 */
export function formatDate(dateString) {
    if (!dateString) return "No due date";

    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Gets random contacts for task assignment, excluding authenticated users.
 * Returns 1-4 randomly selected contact IDs from available contacts.
 * @param {number} [count=3] - Maximum number of random contacts to return.
 * @returns {Array<string>} Array of contact IDs.
 */
export function getRandomContactIds(count = 3) {
    if (!contacts || contacts.length === 0) return [];

    const availableContacts = contacts.filter(c => !c.isAuthUser); // Exclude auth user from random assignment
    if (availableContacts.length === 0) return [];

    const shuffled = [...availableContacts].sort(() => 0.5 - Math.random());
    const selectedCount = Math.min(count, Math.max(1, Math.floor(Math.random() * 4) + 1)); // 1-4 members
    return shuffled.slice(0, selectedCount).map(c => c.id);
}

/**
 * Initializes tasks by loading contacts and tasks from Firebase.
 * Sets up real-time listeners for task updates and handles migration of default tasks.
 * @returns {void}
 */
function initializeTasks() {
    try {
        loadContacts();

        loadTasks((loadedTasks) => {
            tasks = loadedTasks;
            updateHTML();
        });
    } catch (_) {}
}

/**
 * Renders marked user avatars for a task card up to three members, and shows a "+N" indicator when more members exist.
 * @param {Object} element - Task object containing `id` and `member` array.
 * @returns {void}
 */
function initMarkedUsers(element) {
    let markedUserContainer = document.getElementById(`marked-user-container-${element["id"]}`);
    const memberIds = element["member"] || [];

    for (let index = 0; index < memberIds.length; index++) {
        const memberIndex = index + 1;
        if (index === 3) {
            const remainingMembers = memberIds.length - 3;
            markedUserContainer.innerHTML += getTemplateRemainingMembers(memberIndex, remainingMembers);
            break;
        } else {
            const contactId = memberIds[index];
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
                markedUserContainer.innerHTML += getTemplateMarkedUser(memberIndex, contact.initials, contact.avatarColor);
            }
        }
    }

}

/**
 * Moves a task to a new category using the swap menu.
 * @param {Event} event - The click event object.
 * @param {string} taskId - The task id to move.
 * @param {string} category - The target category.
 * @returns {void}
 */
function moveTaskTo(event, taskId, category) {
    event.stopPropagation();

    currentDraggedElement = taskId;
    moveTo(category);

    closeAllSwapMenus();
}


/**
 * Returns the HTML template shown when a column has no tasks.
 * @param {string} section - Display name for the empty state message.
 * @returns {string} HTML string for the empty state display.
 */
function getNoTaskTemplate(section) {
    return `<div class="no-tasks">No tasks ${section}</div>`;
}


/**
 * Shows a dashed placeholder card in a column once during dragover.
 * Prevents duplicate placeholders for the same section while dragging.
 * @param {string} section - Column id where the placeholder should appear.
 * @returns {void}
 */

/**
 * Hides the dashed placeholder and restores the "no tasks" message.
 * Cleans up drag visual feedback after drag operation ends.
 * @param {string} section - Column id.
 * @returns {void}
 */

/**
 * Renders tasks for a specific category by filtering tasks and displaying them in the category container.
 * Shows empty state message if no tasks exist in the category.
 * @param {string} category - Task category identifier (e.g., "todo", "in-progress", "done").
 * @param {string} displayName - Display name for the empty state message.
 * @returns {void}
 */
function renderTasksByCategory(category, displayName) {
    const filteredTasks = tasks.filter((t) => t["category"] === category);
    const containerRef = document.getElementById(category);
    containerRef.innerHTML = "";

    if (filteredTasks.length === 0) containerRef.innerHTML = getNoTaskTemplate(displayName);

    filteredTasks.forEach((task) => {
        const subtasks = task["subtasks"] || [];
        const subtasksDone = task["subtasks_done"] || [];
        const totalSubtasks = subtasks.length + subtasksDone.length;
        const progressWidth = totalSubtasks > 0 ? (subtasksDone.length / totalSubtasks) * 100 : 0;
        containerRef.innerHTML += getTemplateTaskCard(task, subtasksDone, totalSubtasks, progressWidth);
        initMarkedUsers(task);
        hideEmptySubtasks(task)
    });
}

let updateTimeout;

/**
 * Hides the progress container for tasks that have no subtasks.
 * @param {Object} task - The task object to check for subtasks.
 * @returns {void}
 */
function hideEmptySubtasks(task) {
    const progressContainer = document.getElementById(`card-progress-container-${task.id}`);
    if (task.subtasks === undefined && task.subtasks_done === undefined) {
        progressContainer.classList.add("d-none");
    }
}

/**
 * Updates all task columns in the board with debouncing to prevent flickering.
 * Clears previous update timeout and renders tasks for all categories after 50ms delay.
 * @returns {void}
 */
function updateHTML() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        renderTasksByCategory("to-do", "to do");
        renderTasksByCategory("in-progress", "in progress");
        renderTasksByCategory("await-feedback", "awaiting feedback");
        renderTasksByCategory("done", "done");
    }, 100);
}

/**
 * Creates a new task and saves it to Firebase.
 * Adds the task to the local array for immediate UI feedback before syncing with Firebase.
 * @param {Object} taskData - The task data object containing task properties.
 * @param {string} [taskData.task] - The task type (e.g., "User Story", "Technical Task").
 * @param {string} [taskData.title] - The task title.
 * @param {string} [taskData.text] - The task description.
 * @param {Array<string>} [taskData.subtasks] - Array of pending subtask names.
 * @param {Array<string>} [taskData.subtasks_done] - Array of completed subtask names.
 * @param {Array<string>} [taskData.member] - Array of assigned contact IDs.
 * @param {string} [taskData.priority] - Task priority ("low", "medium", "urgent").
 * @param {string} [taskData.category] - Task category/column ("to-do", "in-progress", etc.).
 * @param {string} [taskData.dueDate] - Due date in YYYY-MM-DD format.
 * @returns {Promise<void>}
 */
export async function createNewTask(taskData) {
    try {
        const newTask = {
            ...taskData,
            id: `temp-${Date.now()}`,
            subtasks: taskData.subtasks || [],
            subtasks_done: taskData.subtasks_done || [],
            member: taskData.member || [],
            priority: taskData.priority || "medium",
            category: taskData.category || "to-do",
            dueDate: taskData.dueDate || null
        };

        tasks.push(newTask);
        updateHTML();
        await saveTask(newTask);
    } catch (_) {}
}

/**
 * Adds a contact to a task's member list.
 * Prevents duplicate assignments and saves the update to Firebase.
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} contactId - The unique identifier of the contact to add.
 * @returns {Promise<void>}
 */
async function addContactToTask(taskId, contactId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.member.includes(contactId)) {
        task.member.push(contactId);
        await saveTask(task);
    }
}

/**
 * Removes a contact from a task's member list. => Database Function
 * Saves the update to Firebase after removal.
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} contactId - The unique identifier of the contact to remove.
 * @returns {Promise<void>}
 */
async function removeContactFromTask(taskId, contactId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const index = task.member.indexOf(contactId);
    if (index > -1) {
        task.member.splice(index, 1);
        await saveTask(task);
    }
}

/**
 * Removes a contact from all tasks where they are assigned. => UI Function
 * @param {string} contactId - The unique identifier of the contact to remove.
 * @returns {Promise<void>}
 */
async function removeContactFromAllTasks(contactId) {
    const tasksWithContact = tasks.filter(t => t.member && t.member.includes(contactId));

    for (const task of tasksWithContact) {
        const index = task.member.indexOf(contactId);
        if (index > -1) {
            task.member.splice(index, 1);
            await saveTask(task);
        }
    }

    updateHTML();
}

/**
 * Updates the completion status of a subtask.
 * Moves subtasks between pending and completed arrays and saves to Firebase.
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} subtask - The name of the subtask to update.
 * @param {boolean} isCompleted - Whether the subtask should be marked as completed.
 * @returns {Promise<void>}
 */
async function updateSubtaskStatus(taskId, subtask, isCompleted) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.subtasks) task.subtasks = [];
    if (!task.subtasks_done) task.subtasks_done = [];

    const subtaskIndex = task.subtasks_done.indexOf(subtask);
    if (subtaskIndex > -1) superSwitch(isCompleted, task, subtaskIndex, subtask);

    await saveTask(task);
}

const superSwitch = (isCompleted, task, subtaskIndex, subtask) => {
    if (isCompleted === true) {
        task.subtasks.splice(subtaskIndex, 1);
        task.subtasks_done.push(subtask);
    } else {
        task.subtasks_done.splice(subtaskIndex, 1);
        task.subtasks.push(subtask);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initializeTasks();
    openAddTaskAside();
    desktopMediaQuery.addEventListener('change', handleBoardMediaQueryChange);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('click', (event) => {
        if (event.target.closest('.card-swap-icon')) return;
        closeAllSwapMenus();
    });
});

window.openDialog = openDialog;
window.closeDialog = closeDialog;
window.startDragging = startDragging;
window.allowDrop = allowDrop;
window.handleDragOver = handleDragOver;
window.moveTo = moveTo;
window.toggleSwapMenu = toggleSwapMenu;
window.moveTaskTo = moveTaskTo;
window.closeAllSwapMenus = closeAllSwapMenus;
window.handleDragEnd = handleDragEnd;
window.addContactToTask = addContactToTask;
window.removeContactFromTask = removeContactFromTask;
window.removeContactFromAllTasks = removeContactFromAllTasks;
window.updateSubtaskStatus = updateSubtaskStatus;
window.getRandomContactIds = getRandomContactIds;
window.formatDate = formatDate;
window.createNewTask = createNewTask;
window.openAddTaskAside = openAddTaskAside;
window.deleteTaskButton = deleteTaskButton;
window.filterTasksBySearch = filterTasksBySearch;
window.editTaskInDialog = editTaskInDialog;
