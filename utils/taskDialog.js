import {contacts, formatDate, tasks} from "../js/board.js";
import {validateTaskForm} from "../js/formValidation.js";
import {collectEditTaskData} from "../js/taskDataCollector.js";
import {createTask, deleteTask, updateTask} from "../js/database.js";
import {getEditTaskTemplate, getTemplateDialog, getTemplateMember, getTemplateSubtask} from "../js/template.js";
import {initializeDateInput} from "../js/dateInputManager.js";
import {initializePriorityButtons} from "../js/priorityManager.js";
import {initializeDropdowns, preselectCategory, preselectContacts, resetDropdownState} from "../js/dropdownManager.js";
import {initializeSubtasks, populateSubtasks, resetSubtaskInitialization} from "../js/subtaskManager.js";
import {isDesktop} from "./mediaQuerySwitch.js";
import {clearAllFieldErrors, showFieldError} from "../js/errorHandler.js";

let dialogRef = document.getElementById("dialog-task");

/**
 * Enables editing mode for a task in the dialog by setting up the edit button event listener.
 * @param {Object} element - The task object to be edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
export function editTaskInDialog(element, dueDate) {
    const dialogContentRef = document.querySelector(".dialog-content");
    if (!dialogContentRef) return;

    const handleEditClick = () => {
        showEditConfirmation(dialogContentRef, element, dueDate);
    };

    const editButton = document.querySelector(".d-card-footer-e");
    if (editButton) {
        editButton.addEventListener("click", handleEditClick, {once: true});
    }
}

/**
 * Displays the edit confirmation interface by replacing dialog content with edit form.
 * @param {HTMLElement} dialogContentRef - The dialog content container element.
 * @param {Object} element - The task object being edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
function showEditConfirmation(dialogContentRef, element, dueDate) {
    dialogContentRef.innerHTML = "";
    dialogContentRef.innerHTML = getEditTaskTemplate();
    dialogContentRef.dataset.taskId = element.id;
    dialogContentRef.style.padding = "0";
    dialogContentRef.style.overflow = "visible";

    initializeDateInput(dialogContentRef);
    initializePriorityButtons(dialogContentRef);
    resetDropdownState();
    initializeDropdowns(dialogContentRef);
    resetSubtaskInitialization(dialogContentRef);
    initializeSubtasks(dialogContentRef);
    populateEditForm(dialogContentRef, element);
    initializeEventHandler(dialogContentRef, element, dueDate)
}

/**
 * Initializes event handlers for the edit confirmation interface, including cancel and confirm buttons.
 * @param {HTMLElement} dialogContentRef - The dialog content container element.
 * @param {Object} element - The task object being edited.
 * @param {string} dueDate - The formatted due date string for display.
 */
function initializeEventHandler(dialogContentRef, element, dueDate) {
    const closeEditBtn = dialogContentRef.querySelector('.close-edit-dialog');
    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', () => {
            cancelEditMode(element, dueDate);
        });
    }

    const confirmEditBtn = dialogContentRef.querySelector('.confirm-edit-task-btn');
    if (confirmEditBtn) {
        confirmEditBtn.addEventListener("click", () => confirmEdit(element, dueDate), {once: true});
    }
}

/**
 * Cancels the edit mode and returns to the view mode
 * @param {Object} element - The task object
 * @param {string} dueDate - The formatted due date string
 */
function cancelEditMode(element, dueDate) {
    dialogRef.innerHTML = getTemplateDialog(element, dueDate);
    const dialogContentRef = document.querySelector(".dialog-content");
    resetDialogContentStyle(dialogContentRef);

    initMembers(element["member"]);
    initSubtasks(element["id"]);
    const handleEditClick = () => {
        showEditConfirmation(dialogContentRef, element, dueDate)
    };
    deleteTaskButton(element["id"], handleEditClick);

    const editButton = document.querySelector(".d-card-footer-e");
    if (!editButton) return;
    editButton.addEventListener("click", handleEditClick, {once: true});
}

function resetDialogContentStyle(dialogContentRef) {
    if (dialogContentRef) {
        dialogContentRef.style.padding = "1.25rem 1rem";
        dialogContentRef.style.overflow = "";
    }
}

/**
 * Populates the edit form with existing task data from Firebase
 * @param {HTMLElement} container - The dialog content container element
 * @param {Object} element - The task object containing all task data
 * @returns {void}
 */
function populateEditForm(container, element) {
    const titleInput = container.querySelector('.input-title');
    if (titleInput) titleInput.value = element.title || '';

    const descriptionInput = container.querySelector('.task-description');
    if (descriptionInput) descriptionInput.value = element.text || '';

    const dueDateInput = container.querySelector('.due-date-input');
    if (dueDateInput && element.dueDate) dueDateInput.value = formatDateForInput(element.dueDate);

    setPriorityButton(container, element.priority);
    preselectContacts(element.member, container);
    preselectCategory(element.task, container);
    populateSubtasks(element.subtasks || [], element.subtasks_done || [], container);
}

/**
 * Converts a date from YYYY-MM-DD format to dd/mm/yyyy format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in dd/mm/yyyy format
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
}

/**
 * Sets the active priority button based on the task's priority
 * @param {HTMLElement} container - The container element
 * @param {string} priority - The priority level ('urgent', 'medium', 'low')
 */
function setPriorityButton(container, priority) {
    if (!priority) return;

    const allButtons = container.querySelectorAll('.priority-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    const priorityButton = container.querySelector(`.priority-btn.${priority}`);
    if (priorityButton) {
        priorityButton.classList.add('active');
    }
}

/**
 * Confirms the task edit and saves changes to Firebase.
 * Validates the form, saves changes, and closes the dialog on success.
 * @param {Object} element - The original task object being edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {Promise<void>}
 */
async function confirmEdit(element, dueDate) {
    const dialogContentRef = document.querySelector('.dialog-content');
    const taskId = dialogContentRef?.dataset?.taskId;
    if (!taskId) return;

    const validation = validateTaskForm(dialogContentRef);
    if (!validation.isValid) handleInvalidEditForm(validation.errors, dialogContentRef, element, dueDate);

    try {
        const taskData = collectEditTaskData(dialogContentRef, element);
        delete taskData.category;
        await updateTask(taskId, taskData);
        closeDialog();
    } catch (error) {
        const confirmEditBtn = dialogContentRef.querySelector('.confirm-edit-task-btn');
        if (confirmEditBtn) confirmEditBtn.addEventListener("click", () =>
            confirmEdit(element, dueDate), {once: true});
    }
}

function handleInvalidEditForm(errors, container, element, dueDate) {
    showEditErrors(errors, container);
    const confirmEditBtn = container.querySelector('.confirm-edit-task-btn');
    if (confirmEditBtn) return confirmEditBtn.addEventListener("click", () =>
        confirmEdit(element, dueDate), {once: true});
}

/**
 * Shows validation errors in the edit form
 * @param {Object} errors - Object containing field-specific error messages
 * @param {HTMLElement} container - The container element to scope queries
 */
function showEditErrors(errors, container) {
    clearAllFieldErrors(container);
    if (errors.title) showFieldError('title', errors.title, container);
    if (errors.dueDate) showFieldError('dueDate', errors.dueDate, container);
    if (errors.category) showFieldError('category', errors.category, container);
}

/**
 * Saves a task to Firebase when created or updated.
 * Handles both new tasks (with temporary IDs) and existing tasks.
 * @param {Object} task - The task object to save.
 * @returns {Promise<void>}
 */
export async function saveTask(task) {
    try {
        if (task.id && task.id.startsWith('temp-')) {
            const newId = await createTask(task);
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].id = newId;
            }
        } else if (task.id) {
            await updateTask(task.id, task);
        }
    } catch (_) {
    }
}

/**
 * Deletes a task from Firebase database.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @returns {Promise<void>}
 */
export async function removeTask(taskId) {
    try {
        await deleteTask(taskId);
    } catch (_) {
    }
}

/**
 * Initializes the delete button functionality in the task dialog.
 * Sets up confirmation UI and event listeners for task deletion.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @param {Function} handleEditClick - The click handler for the edit button.
 * @returns {void}
 */
export function deleteTaskButton(taskId, handleEditClick) {
    const deleteButton = document.querySelector(".d-card-footer-d");
    const editButton = document.querySelector(".d-card-footer-e");
    if (!deleteButton || !editButton) return;

    const handleDeleteClick = () => showDeleteConfirmation(deleteButton, editButton, taskId, handleDeleteClick, handleEditClick);
    deleteButton.addEventListener("click", handleDeleteClick, {once: true});
}

/**
 * Shows the confirmation UI for task deletion by displaying checkmark and cancel buttons.
 * Transforms delete and edit buttons into confirmation controls and sets up event handlers.
 * @param {HTMLElement} deleteButton - The delete button element to transform.
 * @param {HTMLElement} editButton - The edit button element to transform.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @param {Function} handleDeleteClick - The click handler for initiating delete.
 * @param {Function} handleEditClick - The click handler for the edit button.
 * @returns {void}
 */
function showDeleteConfirmation(deleteButton, editButton, taskId, handleDeleteClick, handleEditClick) {
    deleteButton.innerHTML = "";
    deleteButton.classList.remove("d-card-footer-d");
    deleteButton.classList.add("delete", "yes");
    deleteButton.addEventListener("click", () => confirmDeleteTask(taskId), {once: true});

    editButton.innerHTML = "";
    editButton.classList.remove("d-card-footer-e");
    editButton.classList.add("delete", "no");
    editButton.removeEventListener("click", handleEditClick);

    editButton.addEventListener("click", () => resetDeleteButtons(deleteButton, editButton, handleDeleteClick, handleEditClick), {once: true});
}

/**
 * Confirms and executes the task deletion by removing the task from Firebase and closing the dialog.
 * Removes cancel event listener before proceeding with deletion.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @returns {Promise<void>}
 */
async function confirmDeleteTask(taskId) {
    await removeTask(taskId);
    closeDialog();
}

/**
 * Resets the delete/edit buttons to their original state after canceling deletion.
 * Removes confirmation click handlers and restores original button appearance and event listeners.
 * @param {HTMLElement} deleteButton - The delete button element.
 * @param {HTMLElement} editButton - The edit button element.
 * @param {Function} handleDeleteClick - The click handler for initiating delete.
 * @param {Function} handleEditClick - The click handler for editing.
 * @returns {void}
 */
function resetDeleteButtons(deleteButton, editButton, handleDeleteClick, handleEditClick) {
    deleteButton.classList.remove("delete", "yes");
    deleteButton.classList.add("d-card-footer-d");
    deleteButton.innerHTML = "Delete";

    editButton.classList.remove("delete", "no");
    editButton.classList.add("d-card-footer-e");

    deleteButton.addEventListener("click", handleDeleteClick, {once: true});
    editButton.addEventListener("click", handleEditClick, {once: true});
}

/**
 * Opens the task dialog for a given task id, displaying task details with swipe-in animation.
 * Initializes members and subtasks display within the dialog.
 * @param {string} index - The task id to open in the dialog.
 * @returns {void}
 */
export function openDialog(index) {
    let element = tasks.filter((task) => task["id"] === `${index}`)[0];

    let mobileDesktopIndicator = "mobile";
    if (isDesktop()) mobileDesktopIndicator = "desktop";
    dialogRef.classList.add("dialog-task")
    dialogRef.classList.add(`dialog-swipe-in-${mobileDesktopIndicator}`);

    const dueDate = element["dueDate"] ? formatDate(element["dueDate"]) : "No due date set";
    dialogRef.innerHTML = getTemplateDialog(element, dueDate);
    initMembers(element["member"]);
    initSubtasks(element["id"]);

    const handleEditClick = () => {
        const dialogContentRef = document.querySelector(".dialog-content");
        showEditConfirmation(dialogContentRef, element, dueDate);
    };

    deleteTaskButton(element["id"], handleEditClick);

    const editButton = document.querySelector(".d-card-footer-e");
    if (editButton) {
        editButton.addEventListener("click", handleEditClick, {once: true});
    }

    dialogRef.showModal();
}

/**
 * Closes the currently open task dialog with a swipe-out animation.
 * Removes the dialog after a 300ms delay to allow animation to complete.
 * @returns {void}
 */
export function closeDialog() {
    let mobileDesktopIndicator = "mobile";
    if (isDesktop()) mobileDesktopIndicator = "desktop";
    dialogRef.classList.remove(`dialog-swipe-in-${mobileDesktopIndicator}`);
    dialogRef.classList.add(`dialog-swipe-out-${mobileDesktopIndicator}`);

    setTimeout(() => {
        setTimeout(() => {
            dialogRef.removeAttribute("class")
        }, 100);
        dialogRef.close();
    }, 300);
}

/**
 * Populates the dialog's assigned members section from an array of contact ids.
 * Renders member cards with name, initials, and avatar color for each assigned member.
 * @param {Array<string>} memberIds - Array of contact ids assigned to the task.
 * @returns {void}
 */
function initMembers(memberIds) {
    let membersContainer = document.getElementById("d-assigned-members");
    membersContainer.innerHTML = "";
    const memberIdArray = memberIds || [];
    for (let index = 0; index < memberIdArray.length; index++) {
        const contactId = memberIdArray[index];
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            membersContainer.innerHTML += getTemplateMember(contact.name, contact.initials, contact.avatarColor);
        }
    }
}

/**
 * Initializes and renders the subtasks section in the task dialog.
 * Displays both pending and completed subtasks with checkboxes.
 * TODO: Add drag-and-drop functionality to reorder subtasks
 * @param {string} taskId - The unique identifier of the task whose subtasks to render.
 */
function initSubtasks(taskId) {
    let subtasksContainer = document.querySelector(".d-subtasks-check");
    subtasksContainer.innerHTML = "";
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const pendingSubtasks = task.subtasks || [];
    const completedSubtasks = task.subtasks_done || [];

    pendingSubtasks.forEach((subtask, index) => {
        subtasksContainer.innerHTML += getTemplateSubtask(subtask, taskId, index, false);
    });
    completedSubtasks.forEach((subtask, index) => {
        subtasksContainer.innerHTML += getTemplateSubtask(subtask, taskId, index + pendingSubtasks.length, true);
    });

    addSubtaskEventListeners(taskId)
}

/**
 * Adds event listeners to subtask checkboxes in the task dialog.
 * Listens for checkbox changes and updates subtask completion status.
 * @param {string} taskId - The unique identifier of the task whose subtasks need listeners.
 * @returns {void}
 */
function addSubtaskEventListeners(taskId) {
    const checkboxes = document.querySelectorAll(`input[data-task-id="${taskId}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const subtask = this.dataset.subtask;
            const isCompleted = this.checked;
            updateSubtaskStatus(taskId, subtask, isCompleted);
        });
    });
}