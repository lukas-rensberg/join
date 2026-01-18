import {
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    migrateDefaultTasks,
    database
} from './database.js';
import {ref, onValue} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import {
    getTemplateDialog,
    getTemplateTaskCard,
    getTemplateMember,
    getTemplateSubtask,
    getTemplateMarkedUser,
    getTemplateRemainingMembers,
    getTemplateAddTask
} from "./template.js";

import {handleCreateTaskFromBoard} from "./add-task.js";
import {initializeDateInput} from "./date-input-manager.js";
import {initializePriorityButtons} from "./priority-manager.js";
import {initializeDropdowns, preselectContacts, preselectCategory, resetDropdownState} from "./dropdown-manager.js";
import {initializeSubtasks, populateSubtasks, resetSubtaskInitialization} from "./subtask-manager.js";
import {validateTaskForm} from "./form-validation.js";
import {collectEditTaskData} from "./task-data-collector.js";
import {showFieldError, clearAllFieldErrors} from "./error-handler.js";

let currentDraggedElement;
let dialogRef = document.getElementById("dialog-task");
let addTaskRef = document.getElementById("aside-add-task");
let addedTaskRef = document.getElementById("task-added");
let findTask = document.getElementById("search-task");

let tasks = [];
let contacts = [];

let activeDragOverSection = null;
let dragOverThrottle = null;

/**
 * Speichert die Ziel-Kategorie für neue Tasks.
 * Wird gesetzt, wenn ein spalten-spezifischer Plus-Button geklickt wird.
 * @type {string}
 */
let targetCategory = 'to-do';

/**
 * Gibt die aktuell ausgewählte Ziel-Kategorie für neue Tasks zurück.
 * @returns {string} Die Kategorie-ID ('to-do', 'in-progress', 'await-feedback')
 */
export function getTargetCategory() {
    return targetCategory;
}

/**
 * Setzt die Ziel-Kategorie für den nächsten zu erstellenden Task.
 * @param {string} category - Die Kategorie-ID ('to-do', 'in-progress', 'await-feedback')
 * @returns {void}
 */
function setTargetCategory(category) {
    const validCategories = ['to-do', 'in-progress', 'await-feedback', 'done'];
    if (validCategories.includes(category)) {
        targetCategory = category;
    } else {
        targetCategory = 'to-do';
    }
}


/**
 * Enables editing mode for a task in the dialog by setting up the edit button event listener.
 * @param {Object} element - The task object to be edited.
 * @param {string} dueDate - The formatted due date string for display.
 * @returns {void}
 */
function editTaskInDialog(element, dueDate) {
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
    dialogContentRef.style.padding = "0";
    dialogContentRef.style.overflow = "visible";

    dialogContentRef.innerHTML = getEditTaskTemplate();

    dialogContentRef.dataset.taskId = element.id;

    initializeDateInput(dialogContentRef);
    initializePriorityButtons(dialogContentRef);
    resetDropdownState();
    initializeDropdowns(dialogContentRef);
    resetSubtaskInitialization(dialogContentRef);
    initializeSubtasks(dialogContentRef);
    populateEditForm(dialogContentRef, element);

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
 * Returns the HTML template for the edit task form with proper wrapper and close button
 * @returns {string} HTML string for the edit task form
 */
function getEditTaskTemplate() {
    return `
        <div class="edit-task-header">
            <div class="close-edit-dialog"></div>
        </div>
        <div class="add-task-form edit-task-form">
            ${getTemplateAddTask()}
        </div>
        <div class="d-card-footer">
            <div class="confirm-edit-task-btn"></div>
        </div>
    `;
}

/**
 * Cancels the edit mode and returns to the view mode
 * @param {Object} element - The task object
 * @param {string} dueDate - The formatted due date string
 */
function cancelEditMode(element, dueDate) {
    dialogRef.innerHTML = getTemplateDialog(element, dueDate);

    // Reset dialog content styles
    const dialogContentRef = document.querySelector('.dialog-content');
    if (dialogContentRef) {
        dialogContentRef.style.padding = "1.25rem 1rem";
        dialogContentRef.style.overflow = "";
    }

    // Re-initialize members and subtasks display
    initMembers(element["member"]);
    initSubtasks(element["id"]);

    // Re-attach edit and delete button handlers
    const handleEditClick = () => {
        const newDialogContentRef = document.querySelector(".dialog-content");
        showEditConfirmation(newDialogContentRef, element, dueDate);
    };

    deleteTaskButton(element["id"], handleEditClick);

    const editButton = document.querySelector(".d-card-footer-e");
    if (editButton) {
        editButton.addEventListener("click", handleEditClick, {once: true});
    }
}

/**
 * Populates the edit form with existing task data from Firebase
 * @param {HTMLElement} container - The dialog content container element
 * @param {Object} element - The task object containing all task data
 * @returns {void}
 */
function populateEditForm(container, element) {
    // Set title
    const titleInput = container.querySelector('.input-title');
    if (titleInput) {
        titleInput.value = element.title || '';
    }

    // Set description
    const descriptionInput = container.querySelector('.task-description');
    if (descriptionInput) {
        descriptionInput.value = element.text || '';
    }

    // Set due date (convert from YYYY-MM-DD to dd/mm/yyyy)
    const dueDateInput = container.querySelector('.due-date-input');
    if (dueDateInput && element.dueDate) {
        dueDateInput.value = formatDateForInput(element.dueDate);
    }

    // Set priority
    setPriorityButton(container, element.priority);

    // Preselect contacts (async, waits for contacts to load)
    preselectContacts(element.member, container);

    // Preselect category
    preselectCategory(element.task, container);

    // Populate subtasks
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

    // Remove active class from all priority buttons
    const allButtons = container.querySelectorAll('.priority-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to the matching priority button
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

    if (!taskId) {
        console.error('Task ID not found');
        return;
    }

    // Validate form
    const validation = validateTaskForm(dialogContentRef);
    if (!validation.isValid) {
        showEditErrors(validation.errors, dialogContentRef);
        // Re-attach listener for next attempt
        const confirmEditBtn = dialogContentRef.querySelector('.confirm-edit-task-btn');
        if (confirmEditBtn) {
            confirmEditBtn.addEventListener("click", () => confirmEdit(element, dueDate), {once: true});
        }
        return;
    }

    try {
        // Collect task data, preserving done status of unchanged subtasks
        const taskData = collectEditTaskData(dialogContentRef, element);

        // Remove category from update data - task should stay in its current column
        delete taskData.category;

        await updateTask(taskId, taskData);

        closeDialog();
    } catch (error) {
        console.error('Failed to update task:', error);
        // Re-attach listener for retry
        const confirmEditBtn = dialogContentRef.querySelector('.confirm-edit-task-btn');
        if (confirmEditBtn) {
            confirmEditBtn.addEventListener("click", () => confirmEdit(element, dueDate), {once: true});
        }
    }
}

/**
 * Shows validation errors in the edit form
 * @param {Object} errors - Object containing field-specific error messages
 * @param {HTMLElement} container - The container element to scope queries
 */
function showEditErrors(errors, container) {
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
 * Filters tasks by search input from the search field.
 * Searches for matches in task titles (case-insensitive).
 * Updates the board display with filtered results or resets to show all tasks if search is empty.
 * @returns {void}
 */
function filterTasksBySearch() {
    const searchInput = findTask.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchInput) || task.text.toLowerCase().includes(searchInput)
    );
    if (!searchInput) {
        updateHTML();
        return;
    }

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

        if (categoryTasks.length === 0) {
            containerRef.innerHTML = getNoTaskTemplate(category);
            return;
        }

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
 * Opens the add task aside panel with a swipe-in animation.
 * Removes any swipe-out class and adds the swipe-in class before showing the modal dialog.
 * @returns {void}
 */
function swipeInAddTaskAside() {
    addTaskRef.classList.remove("add-task-swipe-out");
    addTaskRef.classList.add("add-task-swipe-in");
    addTaskRef.showModal();
}

/**
 * Closes the add task aside panel with a swipe-out animation.
 * Removes the swipe-in class and adds the swipe-out class, then closes the modal after 300ms delay.
 * @returns {void}
 */
function swipeOutAddTaskAside() {
    addTaskRef.classList.remove("add-task-swipe-in");
    addTaskRef.classList.add("add-task-swipe-out");
    setTimeout(() => {
        addTaskRef.close();
    }, 300);
}

/**
 * Sets up the create button event listener for the add task aside panel.
 * Handles task creation, success animation, and closing of modals with appropriate timing.
 * Uses the currently set targetCategory for the new task.
 * @returns {void}
 */
function addTaskCreateButton() {
    const addedTaskBtn = document.querySelector(".btn-create-aside");

    addedTaskBtn.addEventListener("click", async () => {
        const successAdded = await handleCreateTaskFromBoard(document, getTargetCategory());

        if (!successAdded) return;

        swipeInAddedTask();
        setTimeout(() => {
            addTaskRef.classList.remove("add-task-swipe-in");
            addTaskRef.classList.add("add-task-swipe-out");
            addedTaskRef.classList.remove("move-animation-board");
            setTimeout(() => {
                addedTaskRef.close();
                addTaskRef.close();
            }, 200);
        }, 1000);
    });
}

/**
 * Shows the task added confirmation dialog with a slide-in animation.
 * Opens the modal and applies the animation class to display the success message.
 * @returns {void}
 */
function swipeInAddedTask() {
    addedTaskRef.showModal();
    addedTaskRef.classList.add("move-animation-board");

}

/**
 * Opens the add task interface based on the device screen size.
 * On larger screens (min-width: 812px), displays an aside panel with swipe animations.
 * On smaller screens, redirects to the add-task.html page with category parameter.
 * Sets up event listeners for opening and closing the add task interface.
 * Reads data-category attribute from clicked icon to set target category.
 * @returns {void}
 */
function openAddTaskAside() {
    const mediaQuery = window.matchMedia("(min-width: 812px)").matches;
    const openIcons = document.querySelectorAll('.add-task-icon');
    const addTaskBtn = document.querySelector('.add-task-btn');

    if (mediaQuery) {
        // Plus-Icons mit spalten-spezifischer Kategorie
        openIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const category = icon.dataset.category || 'to-do';
                setTargetCategory(category);
                createAddTask();  // Erstelle/initialisiere bei jedem Öffnen neu
                swipeInAddTaskAside();
            });
        });

        // Großer "Add Task" Button - Standard ist 'to-do'
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                setTargetCategory('to-do');
                createAddTask();  // Erstelle/initialisiere bei jedem Öffnen neu
                swipeInAddTaskAside();
            });
        }
    } else {

        // Mobile: Redirect with category as URL-Param
        openIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const category = icon.dataset.category || 'to-do';
                window.location.href = `add-task.html?category=${category}`;
            });
        });
    }

    const closeButton = document.querySelector('.close-add-task');
    if (closeButton) {
        closeButton.addEventListener('click', swipeOutAddTaskAside);

    }
    addTaskCreateButton()
}

/**
 * Creates and renders the add task dialog by clearing the description container
 * and inserting the add task template HTML.
 * Initializes all form components (date input, priority buttons, dropdowns, subtasks) after rendering.
 * Uses the dialog element as container for proper event delegation in modals.
 * @returns {void}
 */
function createAddTask() {
    const dialogElement = document.querySelector('#aside-add-task');
    const refAddTask = dialogElement?.querySelector('.add-task-form');
    if (!refAddTask) return;
    refAddTask.innerHTML = "";
    refAddTask.innerHTML = getTemplateAddTask();

    // Initialize form components with dialog as container for better event handling in modals
    initializeDateInput(dialogElement);
    initializePriorityButtons(dialogElement);
    resetDropdownState();
    initializeDropdowns(dialogElement);
    resetSubtaskInitialization(dialogElement);
    initializeSubtasks(dialogElement);
}

/**
 * Retrieves a contact object by its unique identifier.
 * @param {string} contactId - The unique identifier of the contact to find.
 * @returns {Object|undefined} The contact object if found, undefined otherwise.
 */
export function getContactById(contactId) {
    return contacts.find(c => c.id === contactId);
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
 * Creates default tasks with random member assignments for initial setup.
 * Each task is assigned 1-4 random contacts from the available contacts list.
 * @returns {Array<Object>} Array of default task objects with random members.
 */
export function createDefaultTasksWithMembers() {
    return [
        {
            id: "to-do-1",
            task: "User Story",
            title: "Kochwelt Page & Recipe Recommender",
            text: "Build start page with recipe recommendation...",
            subtasks: ["Beta Test", "Double Check", "Design Mockup", "Gather Content"],
            subtasks_done: ["Start Layout", "Implement Recipe Recommendation"],
            member: getRandomContactIds(),
            priority: "medium",
            category: "to-do",
            dueDate: "2025-12-15",
        },
        {
            id: "to-do-2",
            task: "Technical Task",
            title: "HTML Base Template Creation",
            text: "Create reusable HTML base templates...",
            subtasks: ["Beta Test", "Double Check", "Extra Subtask"],
            subtasks_done: ["Another Subtask", "More Subtasks"],
            member: getRandomContactIds(),
            priority: "urgent",
            category: "to-do",
            dueDate: "2025-12-10",
        },
        {
            id: "await-feedback-1",
            task: "User Story",
            title: "HTML Base Template Creation",
            text: "Create reusable HTML base templates...",
            subtasks: ["Beta Test"],
            subtasks_done: ["Double Check"],
            member: getRandomContactIds(),
            priority: "urgent",
            category: "await-feedback",
            dueDate: "2025-12-08",
        },
        {
            id: "in-progress-1",
            task: "Technical Task",
            title: "HTML Base Template Creation",
            text: "Create reusable HTML base templates...",
            subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
            subtasks_done: [],
            member: getRandomContactIds(),
            priority: "urgent",
            category: "in-progress",
            dueDate: "2025-12-20",
        },
        {
            id: "done-2",
            task: "User Story",
            title: "HTML Base Template Creation",
            text: "Create reusable HTML base templates...",
            subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
            subtasks_done: ["Double Check"],
            member: getRandomContactIds(),
            priority: "low",
            category: "done",
            dueDate: "2025-11-30",
        },
    ];
}

// Default tasks for initial setup/migration - using placeholder contact IDs
const defaultTasks = [
    {
        id: "to-do-1",
        task: "User Story",
        title: "Kochwelt Page & Recipe Recommender",
        text: "Build start page with recipe recommendation...",
        subtasks: ["Beta Test", "Double Check", "Design Mockup", "Gather Content"],
        subtasks_done: ["Start Layout", "Implement Recipe Recommendation"],
        member: [],
        priority: "medium",
        category: "to-do",
    },
    {
        id: "to-do-2",
        task: "Technical Task",
        title: "HTML Base Template Creation",
        text: "Create reusable HTML base templates...",
        subtasks: ["Beta Test", "Double Check", "Extra Subtask"],
        subtasks_done: ["Another Subtask", "More Subtasks"],
        member: [],
        priority: "urgent",
        category: "to-do",
    },
    {
        id: "await-feedback-1",
        task: "User Story",
        title: "HTML Base Template Creation",
        text: "Create reusable HTML base templates...",
        subtasks: ["Beta Test"],
        subtasks_done: ["Double Check"],
        member: [],
        priority: "urgent",
        category: "await-feedback",
    },
    {
        id: "in-progress-1",
        task: "Technical Task",
        title: "HTML Base Template Creation",
        text: "Create reusable HTML base templates...",
        subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
        subtasks_done: [],
        member: [],
        priority: "urgent",
        category: "in-progress",
    },
    {
        id: "done-2",
        task: "User Story",
        title: "HTML Base Template Creation",
        text: "Create reusable HTML base templates...",
        subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
        subtasks_done: ["Double Check"],
        member: [],
        priority: "low",
        category: "done",
    },
];

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

        setTimeout(() => {
            migrateDefaultTasksWithMembers();
        }, 1000);
    } catch (error) {
        console.error('Error initializing tasks:', error);
        tasks = [...defaultTasks];
        updateHTML();
    }
}

/**
 * Migrates default tasks with random member assignments to Firebase.
 * Falls back to default tasks without members if random assignment fails.
 * @returns {Promise<void>}
 */
async function migrateDefaultTasksWithMembers() {
    try {
        const tasksWithMembers = createDefaultTasksWithMembers();
        await migrateDefaultTasks(tasksWithMembers);
    } catch (error) {
        await migrateDefaultTasks(defaultTasks);
    }
}

/**
 * Saves a task to Firebase when created or updated.
 * Handles both new tasks (with temporary IDs) and existing tasks.
 * @param {Object} task - The task object to save.
 * @returns {Promise<void>}
 */
async function saveTask(task) {
    try {
        if (task.id && task.id.startsWith('temp-')) {
            // New task - create in Firebase
            const newId = await createTask(task);
            // Update local task with new ID
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].id = newId;
            }
        } else if (task.id) {
            // Existing task - update in Firebase
            await updateTask(task.id, task);
        }
    } catch (error) {
        console.error('Error saving task:', error);
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
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Initializes the delete button functionality in the task dialog.
 * Sets up confirmation UI and event listeners for task deletion.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @param {Function} handleEditClick - The click handler for the edit button.
 * @returns {void}
 */
function deleteTaskButton(taskId, handleEditClick) {
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
    editButton.innerHTML = "";

    deleteButton.classList.remove("d-card-footer-d");
    deleteButton.classList.add("delete", "yes");

    editButton.classList.remove("d-card-footer-e");
    editButton.classList.add("delete", "no");

    editButton.removeEventListener("click", handleEditClick);

    let handleCancelClick;
    let handleConfirmClick;

    handleCancelClick = () => resetDeleteButtons(deleteButton, editButton, handleDeleteClick, handleConfirmClick, handleEditClick);
    handleConfirmClick = () => confirmDeleteTask(taskId, editButton, handleCancelClick);

    editButton.addEventListener("click", handleCancelClick, {once: true});
    deleteButton.addEventListener("click", handleConfirmClick, {once: true});
}

/**
 * Confirms and executes the task deletion by removing the task from Firebase and closing the dialog.
 * Removes cancel event listener before proceeding with deletion.
 * @param {string} taskId - The unique identifier of the task to delete.
 * @param {HTMLElement} editButton - The edit button element.
 * @param {Function} handleCancelClick - The click handler for canceling delete.
 * @returns {Promise<void>}
 */
async function confirmDeleteTask(taskId, editButton, handleCancelClick) {
    editButton.removeEventListener("click", handleCancelClick);
    await removeTask(taskId);
    closeDialog();
}

/**
 * Resets the delete/edit buttons to their original state after canceling deletion.
 * Removes confirmation click handlers and restores original button appearance and event listeners.
 * @param {HTMLElement} deleteButton - The delete button element.
 * @param {HTMLElement} editButton - The edit button element.
 * @param {Function} handleDeleteClick - The click handler for initiating delete.
 * @param {Function} handleConfirmClick - The click handler for confirming delete.
 * @param {Function} handleEditClick - The click handler for the edit button.
 * @returns {void}
 */
function resetDeleteButtons(deleteButton, editButton, handleDeleteClick, handleConfirmClick, handleEditClick) {
    deleteButton.removeEventListener("click", handleConfirmClick);

    deleteButton.classList.remove("delete", "yes");
    deleteButton.classList.add("d-card-footer-d");
    deleteButton.innerHTML = "Delete";

    editButton.classList.remove("delete", "no");
    editButton.classList.add("d-card-footer-e");
    editButton.innerHTML = "Edit";

    deleteButton.addEventListener("click", handleDeleteClick, {once: true});
    editButton.addEventListener("click", handleEditClick, {once: true});
}

/**
 * Renders marked user avatars for a task card up to three members,
 * and shows a "+N" indicator when more members exist.
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
            const contact = getContactById(contactId);
            if (contact) {
                markedUserContainer.innerHTML += getTemplateMarkedUser(memberIndex, contact.initials, contact.avatarColor);
            }
        }
    }
}

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

    if (filteredTasks.length === 0) {
        containerRef.innerHTML = getNoTaskTemplate(displayName);
        return;
    }

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
    }, 100); // Increased debounce to 100ms
}

/**
 * Marks the task as being dragged and adds the dragging CSS class for visual feedback.
 * @param {string} id - DOM id of the dragged task element.
 * @returns {void}
 */
function startDragging(id) {
    currentDraggedElement = id;
    document.getElementById(currentDraggedElement).classList.add("is-dragging");
}

/**
 * Allows dropping by preventing the default browser dragover behavior.
 * Required to enable drop functionality on the target element.
 * @param {DragEvent} event - Dragover event object.
 * @returns {void}
 */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Handles dragover events for board columns with lightweight throttling (~60fps).
 * Provides visual feedback by highlighting the container and showing a placeholder.
 * @param {DragEvent} event - The dragover event object.
 * @param {string} section - The id of the column being dragged over.
 * @returns {void}
 */
function handleDragOver(event, section) {
    event.preventDefault();

    // Throttle the calls to prevent excessive DOM manipulation
    if (dragOverThrottle) return;

    dragOverThrottle = setTimeout(() => {
        dragOverThrottle = null;
    }, 16); // ~60fps throttling

    bgContainer(section);
    showDashedBoxOnce(section);
}

/**
 * Moves the currently dragged task to a new category and persists the change to Firebase.
 * Removes dragging visual feedback and cleans up the drag state.
 * @param {string} category - Target category id (e.g. "to-do", "in-progress", "await-feedback", "done").
 * @returns {void}
 */
function moveTo(category) {
    const taskToUpdate = tasks.find(task => task.id === currentDraggedElement);
    if (taskToUpdate) {
        taskToUpdate.category = category;
        saveTask(taskToUpdate);
    }
    document.getElementById(currentDraggedElement).classList.remove("is-dragging");
    bgContainerRemove(category);
}

/**
 * Closes all open swap dropdown menus.
 * @returns {void}
 */
function closeAllSwapMenus() {
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
function toggleSwapMenu(event, taskId, currentCategory) {
    event.stopPropagation();

    const dropdown = document.getElementById(`swap-dropdown-${taskId}`);
    if (!dropdown) return;

    // Close all other dropdowns first
    const allDropdowns = document.querySelectorAll('.card-swap-dropdown');
    allDropdowns.forEach(openDropdown => {
        if (openDropdown !== dropdown) openDropdown.classList.remove('open');
    });

    // Show/hide category options based on current category
    const items = dropdown.querySelectorAll('.move-to-do, .move-to-review');
    items.forEach(item => {
        if (item.dataset.category === currentCategory) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });

    // Toggle the dropdown
    dropdown.classList.toggle('open');
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
 * Adds the dragover CSS class to the container to provide visual feedback during drag operations.
 * @param {string} id - Container element id.
 * @returns {void}
 */
function bgContainer(id) {
    document.getElementById(id).classList.add("task-card-container-dragover");
}


/**
 * Removes the dragover CSS class and hides the dashed placeholder for a container.
 * Cleans up visual feedback after drag operation completes.
 * @param {string} id - Container element id.
 * @returns {void}
 */
function bgContainerRemove(id) {
    hideDashedBox(id);
    document.getElementById(id).classList.remove("task-card-container-dragover");
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
function showDashedBoxOnce(section) {
    // Prevent repeated calls for the same section
    if (activeDragOverSection === section) return;

    const container = document.getElementById(section);
    if (!container) return;

    // Check if already has empty card to avoid duplicate additions
    if (container.querySelector(".empty-card")) {
        activeDragOverSection = section;
        return;
    }

    const noTasksElem = container.querySelector(".no-tasks");
    if (noTasksElem) {
        noTasksElem.style.display = "none";
    }

    // Use insertAdjacentHTML instead of innerHTML += to avoid reflow
    container.insertAdjacentHTML('beforeend', generateEmptyCard());
    activeDragOverSection = section;
}


/**
 * Hides the dashed placeholder and restores the "no tasks" message.
 * Cleans up drag visual feedback after drag operation ends.
 * @param {string} section - Column id.
 * @returns {void}
 */
function hideDashedBox(section) {
    const container = document.getElementById(section);
    if (!container) return;

    const noTasksElem = container.querySelector(".no-tasks");
    if (noTasksElem) {
        noTasksElem.style.display = "flex";
    }

    const emptyCard = container.querySelector(".empty-card");
    if (emptyCard) {
        emptyCard.remove(); // Use remove() instead of parentNode.removeChild
    }

    // Reset the active section flag
    if (activeDragOverSection === section) {
        activeDragOverSection = null;
    }
}

/**
 * Generates the HTML markup for the empty dashed card placeholder used during dragover.
 * @returns {string} HTML string for an empty card placeholder.
 */
function generateEmptyCard() {
    return `<div class="empty-card"></div>`;
}

/**
 * Opens the task dialog for a given task id, displaying task details with swipe-in animation.
 * Initializes members and subtasks display within the dialog.
 * @param {string} index - The task id to open in the dialog.
 * @returns {void}
 */
function openDialog(index) {
    let element = tasks.filter((task) => task["id"] === `${index}`)[0];
    dialogRef.classList.remove("dialog-swipe-out");
    dialogRef.classList.add("dialog-swipe-in");
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
function closeDialog() {
    dialogRef.classList.remove("dialog-swipe-in");
    dialogRef.classList.add("dialog-swipe-out");
    setTimeout(() => {
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
        const contact = getContactById(contactId);
        if (contact) {
            membersContainer.innerHTML += getTemplateMember(contact.name, contact.initials, contact.avatarColor);
        }
    }
}

/**
 * Initializes and renders the subtasks section in the task dialog.
 * Displays both pending and completed subtasks with checkboxes.
 * @param {string} taskId - The unique identifier of the task whose subtasks to render.
 */
function initSubtasks(taskId) {
    let subtasksContainer = document.querySelector(".d-subtasks-check");
    subtasksContainer.innerHTML = "";

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const pendingSubtasks = task.subtasks || [];
    const completedSubtasks = task.subtasks_done || [];

    // Add pending subtasks
    pendingSubtasks.forEach((subtask, index) => {
        subtasksContainer.innerHTML += getTemplateSubtask(subtask, taskId, index, false);
    });

    // Add completed subtasks
    completedSubtasks.forEach((subtask, index) => {
        subtasksContainer.innerHTML += getTemplateSubtask(subtask, taskId, index + pendingSubtasks.length, true);
    });

    // Add event listeners after DOM is updated
    setTimeout(() => addSubtaskEventListeners(taskId), 0);
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
            id: `temp-${Date.now()}`, // Temporary ID until Firebase assigns real one
            subtasks: taskData.subtasks || [],
            subtasks_done: taskData.subtasks_done || [],
            member: taskData.member || [],
            priority: taskData.priority || "medium",
            category: taskData.category || "to-do",
            dueDate: taskData.dueDate || null
        };

        // Add to local array first for immediate UI feedback
        tasks.push(newTask);
        updateHTML();

        // Save to Firebase
        await saveTask(newTask);
    } catch (error) {
        console.error('Error creating new task:', error);
        // Remove from local array if Firebase save failed
        const index = tasks.findIndex(t => t.id === newTask.id);
        if (index > -1) {
            tasks.splice(index, 1);
            updateHTML();
        }
    }
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
        // updateHTML will be called by Firebase listener
    }
}

/**
 * Removes a contact from a task's member list.
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
        // updateHTML will be called by Firebase listener
    }
}

/**
 * Removes a contact from all tasks where they are assigned.
 * Called when a contact is deleted from the system.
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

    // Ensure subtask arrays exist
    if (!task.subtasks) task.subtasks = [];
    if (!task.subtasks_done) task.subtasks_done = [];

    if (isCompleted) {
        // Move from subtasks to subtasks_done
        const subtaskIndex = task.subtasks.indexOf(subtask);
        if (subtaskIndex > -1) {
            task.subtasks.splice(subtaskIndex, 1);
            task.subtasks_done.push(subtask);
        }
    } else {
        // Move from subtasks_done to subtasks
        const subtaskIndex = task.subtasks_done.indexOf(subtask);
        if (subtaskIndex > -1) {
            task.subtasks_done.splice(subtaskIndex, 1);
            task.subtasks.push(subtask);
        }
    }

    // Save the updated task to Firebase
    await saveTask(task);
    // No need to call updateHTML() here since we're in a dialog
    // The board will update when the dialog closes or through real-time listeners
}

// Initialize the board when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTasks();
    openAddTaskAside();
});

// Make functions globally accessible for inline event handlers
window.openDialog = openDialog;
window.closeDialog = closeDialog;
window.startDragging = startDragging;
window.allowDrop = allowDrop;
window.handleDragOver = handleDragOver;
window.moveTo = moveTo;
window.toggleSwapMenu = toggleSwapMenu;
window.moveTaskTo = moveTaskTo;
window.bgContainer = bgContainer;
window.bgContainerRemove = bgContainerRemove;
window.showDashedBoxOnce = showDashedBoxOnce;
window.hideDashedBox = hideDashedBox;
window.addContactToTask = addContactToTask;
window.removeContactFromTask = removeContactFromTask;
window.removeContactFromAllTasks = removeContactFromAllTasks;
window.updateSubtaskStatus = updateSubtaskStatus;
window.getRandomContactIds = getRandomContactIds;
window.formatDate = formatDate;
window.createNewTask = createNewTask;
window.openAddTaskAside = openAddTaskAside;
window.addEventListener('resize', openAddTaskAside);
window.deleteTaskButton = deleteTaskButton;
window.filterTasksBySearch = filterTasksBySearch;
window.editTaskInDialog = editTaskInDialog;
