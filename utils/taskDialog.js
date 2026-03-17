import {contacts, formatDate, tasks} from "../js/board.js";
import {validateTaskForm} from "../js/formValidation.js";
import {collectEditTaskData} from "../js/taskDataCollector.js";
import {createTask, deleteTask, updateTask} from "../js/database.js";
import {getEditTaskTemplate, getTemplateDialog, getTemplateMember} from "../js/template.js";
import {initializeDateInput} from "../js/dateInputManager.js";
import {initializePriorityButtons, updatePriorityIcon} from "../js/priorityManager.js";
import {initializeDropdowns, preselectCategory, preselectContacts, resetDropdownState} from "../js/dropdownManager.js";
import {initializeSubtasks, initSubtasks, populateSubtasks, resetSubtaskInitialization} from "../js/subtaskManager.js";
import {isDesktop} from "./mediaQuerySwitch.js";
import {clearAllFieldErrors, clearFieldError, showFieldError} from "../js/errorHandler.js";

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

    const dueDateInput = dialogContentRef.querySelector('.date-input-hidden');
    if (dueDateInput && element.dueDate) {
        dueDateInput.value = element.dueDate;
    }
    initializeDateInput(dialogContentRef, {
        allowPastDates: true,
        onDateChanged: () => clearFieldError('dueDate', dialogContentRef)
    });
    showEditConfirmationSub(dialogContentRef, element, dueDate);
}

/**
 * Continues the edit confirmation setup by initializing form components and populating fields.
 * Handles priority buttons, dropdowns, subtasks, and event handlers initialization.
 * @param {HTMLElement} dialogContentRef - The dialog content container element.
 * @param {Object} element - The task object being edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
function showEditConfirmationSub(dialogContentRef, element, dueDate) {
    populateEditFormBasicFieldsWithoutDate(dialogContentRef, element);
    initializePriorityButtons(dialogContentRef);
    resetDropdownState();
    initializeDropdowns(dialogContentRef, document.querySelector(".edit-task-form"));
    resetSubtaskInitialization(dialogContentRef);
    initializeSubtasks(dialogContentRef);
    populateEditFormAdvancedFields(dialogContentRef, element);
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

/**
 * Resets the dialog content element's inline styles to default values.
 * Restores padding and removes overflow styling after exiting edit mode.
 * @param {HTMLElement} dialogContentRef - The dialog content container element.
 * @returns {void}
 */
function resetDialogContentStyle(dialogContentRef) {
    if (dialogContentRef) {
        dialogContentRef.style.padding = "1.25rem 1rem";
        dialogContentRef.style.overflow = "";
    }
}

/**
 * Populates basic fields in the edit form (title, description) without date
 * Date is set before calendar initialization in showEditConfirmation
 * @param {HTMLElement} container - The dialog content container element
 * @param {Object} element - The task object containing all task data
 * @returns {void}
 */
function populateEditFormBasicFieldsWithoutDate(container, element) {
    const titleInput = container.querySelector('.input-title');
    if (titleInput) titleInput.value = element.title || '';

    const descriptionInput = container.querySelector('.task-description');
    if (descriptionInput) descriptionInput.value = element.text || '';
}

/**
 * Populates advanced fields in the edit form (priority, contacts, category, subtasks)
 * Should be called AFTER initializing dropdowns and other components
 * @param {HTMLElement} container - The dialog content container element
 * @param {Object} element - The task object containing all task data
 * @returns {void}
 */
function populateEditFormAdvancedFields(container, element) {
    setPriorityButton(container, element.priority);
    preselectContacts(element.member, container);
    preselectCategory(element.task, container);
    populateSubtasks(element.subtasks || [], element.subtasks_done || [], container);
}

/**
 * Sets the active priority button based on the task's priority
 * @param {HTMLElement} container - The container element
 * @param {string} priority - The priority level ('urgent', 'medium', 'low')
 */
function setPriorityButton(container, priority) {
    if (!priority) return;

    const allButtons = container.querySelectorAll('.priority-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('active')
        updatePriorityIcon(btn, false);
    });

    const priorityButton = container.querySelector(`.priority-btn.${priority}`);
    if (priorityButton) {
        updatePriorityIcon(priorityButton, true);
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
        if (confirmEditBtn) confirmEditBtn.addEventListener("click", () => confirmEdit(element, dueDate), {once: true});
    }
}

/**
 * Handles invalid edit form submission by displaying errors and re-attaching the confirm button listener.
 * Shows validation errors and allows the user to retry after fixing issues.
 * @param {Object} errors - Object containing field-specific error messages.
 * @param {HTMLElement} container - The dialog content container element.
 * @param {Object} element - The original task object being edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
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
    if (errors.description) showFieldError('description', errors.description, container);
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

    let dueDate = initializeDialogDisplay(element);
    
    setupEditButton(element, dueDate);
    dialogRef.showModal();
}

/**
 * Initializes and displays the dialog with task content and animations.
 * Sets up CSS classes for swipe animation, renders template, and initializes members/subtasks.
 * @param {Object} element - The task object to display in the dialog.
 * @returns {string} The formatted due date string for further use.
 */
function initializeDialogDisplay(element) {
    let mobileDesktopIndicator = "mobile";
    if (isDesktop()) mobileDesktopIndicator = "desktop";
    dialogRef.classList.add("dialog-task");
    dialogRef.classList.add(`dialog-swipe-in-${mobileDesktopIndicator}`);

    const dueDate = element["dueDate"] ? formatDate(element["dueDate"]) : "No due date set";
    dialogRef.innerHTML = getTemplateDialog(element, dueDate);
    initMembers(element["member"]);
    initSubtasks(element["id"]);
    
    return dueDate;
}

/**
 * Sets up the edit button event listener and delete button for a task in the dialog.
 * Creates the edit click handler and attaches it to the edit button.
 * @param {Object} element - The task object to be edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
function setupEditButton(element, dueDate) {
    const handleEditClick = () => {
        const dialogContentRef = document.querySelector(".dialog-content");
        showEditConfirmation(dialogContentRef, element, dueDate);
    };

    deleteTaskButton(element["id"], handleEditClick);

    const editButton = document.querySelector(".d-card-footer-e");
    if (editButton) {
        editButton.addEventListener("click", handleEditClick, {once: true});
    }
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
