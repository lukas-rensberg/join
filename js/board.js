import {
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    migrateDefaultTasks,
    database
} from './database.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import {
    getTemplateDialog,
    getTemplateTaskCard,
    getTemplateMember,
    getTemplateSubtask,
    getTemplateMarkedUser,
    getTemplateRemainingMembers,
    getTemplateAddTask
} from "./template.js";

let currentDraggedElement;
let dialogRef = document.getElementById("dialog-task");
let addTaskRef = document.getElementById("aside-add-task");

let tasks = [];
let contacts = [];

let activeDragOverSection = null;
let dragOverThrottle = null;

/**
 * Loads contacts from Firebase database and stores them in the contacts array.
 * Sets up a real-time listener that updates contacts when changes occur.
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
 * Removes any swipe-out class and adds the swipe-in class before showing the modal.
 */
function swipeInAddTaskAside() {
    addTaskRef.classList.remove("add-task-swipe-out");
    addTaskRef.classList.add("add-task-swipe-in");
    addTaskRef.showModal();
}

/**
 * Closes the add task aside panel with a swipe-out animation.
 * Removes the swipe-in class and adds the swipe-out class before closing the modal.
 */
function swipeOutAddTaskAside() {
    addTaskRef.classList.remove("add-task-swipe-in");
    addTaskRef.classList.add("add-task-swipe-out");
    addTaskRef.close();
}

/**
 * Opens the add task interface based on the device screen size.
 * On larger screens (min-width: 812px), displays an aside panel with swipe animations.
 * On smaller screens, redirects to the add-task.html page.
 * Sets up event listeners for opening and closing the add task interface.
 * 
 * @function openAddTaskAside
 * @returns {void}
 */
function openAddTaskAside() {
    const mediaQuery = window.matchMedia("(min-width: 812px)").matches;
    const openButtons = document.querySelectorAll('.add-task-icon, .add-task-btn');
    const openIcons = document.querySelectorAll('.add-task-icon');

    if (mediaQuery) {
        createAddTask();
        openButtons.forEach(button => {
            button.addEventListener('click', swipeInAddTaskAside);
        })
    } else {
        createAddTask()
        openIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                window.location.href = 'add-task.html';
            });
        })
    }

    const closeButton = document.querySelector('.close-add-task');
    if (closeButton) {
        closeButton.addEventListener('click', swipeOutAddTaskAside);

    }
}

/**
 * Creates and renders the add task dialog by clearing the description container
 * and inserting the add task template HTML.
 * @function createAddTask
 * @returns {void}
 */
function createAddTask() {
    const refAddTask = document.querySelector('.description');
    refAddTask.innerHTML = "";
    refAddTask.innerHTML = getTemplateAddTask();
};

/**
 * Retrieves a contact object by its unique identifier.
 * @param {string} contactId - The unique identifier of the contact to find.
 * @returns {Object|undefined} The contact object if found, undefined otherwise.
 */
export function getContactById(contactId) {
    return contacts.find(c => c.id === contactId);
}

/**
 * Format date string for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
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
 * Get random contacts for task assignment
 * @param {number} count - Number of random contacts to return
 * @returns {Array} Array of contact IDs
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
 * Create default tasks with random member assignments
 * @returns {Array} Array of default tasks with random members
 */
export function createDefaultTasksWithMembers() {
    return [
        {
            id: "to-do-1",
            task: "User Story",
            title: "Kochwelt Page & Recipe Recommender",
            text: "Build start page with recipe recommandation...",
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
        text: "Build start page with recipe recommandation...",
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
 * Initialize tasks by loading from Firebase
 */
function initializeTasks() {
    try {
        loadContacts();

        loadTasks((loadedTasks) => {
            tasks = loadedTasks;
            updateHTML();
        });

        // Wait for contacts to load before migrating tasks with random members
        setTimeout(() => {
            migrateDefaultTasksWithMembers();
        }, 1000); // Give contacts time to load
    } catch (error) {
        console.error('Error initializing tasks:', error);
        tasks = [...defaultTasks];
        updateHTML();
    }
}

/**
 * Migrate default tasks with random member assignments
 */
async function migrateDefaultTasksWithMembers() {
    try {
        const tasksWithMembers = createDefaultTasksWithMembers();
        await migrateDefaultTasks(tasksWithMembers);
    } catch (error) {
        console.error('Error migrating tasks with members:', error);
        // Fallback to default tasks without members
        await migrateDefaultTasks(defaultTasks);
    }
}

/**
 * Save task to Firebase when created or updated
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
 * Delete task from Firebase
 */
export async function removeTask(taskId) {
    try {
        await deleteTask(taskId);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Render marked user avatars for a task card up to three members,
 * and show a "+N" indicator when more members exist.
 * @param {Object} element - Task object containing `id` and `member` array.
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
 * Renders tasks for a specific category
 * @param {string} category Task category
 * @param {string} displayName Display name for empty state
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
    });
}

let updateTimeout;

/**
 * Updates all task columns in the board with debouncing to prevent flickering
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
 * Mark the task as being dragged and add dragging CSS class.
 * @param {string} id - DOM id of the dragged task element.
 */
function startDragging(id) {
    currentDraggedElement = id;
    document.getElementById(currentDraggedElement).classList.add("is-dragging");
}


/**
 * Allow dropping by preventing default browser behavior.
 * @param {Event} event - Dragover event.
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Handle dragover events for board columns, with lightweight throttling
 * and visual feedback (highlight container and show placeholder).
 * @param {Event} event - The dragover event.
 * @param {string} section - The id of the column being dragged over.
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
 * Move the currently dragged task to a new category and persist the change.
 * @param {string} category - Target category id (e.g. "to-do", "in-progress").
 */
function moveTo(category) {
    const taskToUpdate = tasks.find(task => task.id === currentDraggedElement);
    if (taskToUpdate) {
        taskToUpdate.category = category;
        // Save the updated task to Firebase
        saveTask(taskToUpdate);
    }
    document.getElementById(currentDraggedElement).classList.remove("is-dragging");
    bgContainerRemove(category);
    // Remove updateHTML() call as Firebase listener will handle the update
}


/**
 * Add dragover CSS class to the container with the given id.
 * @param {string} id - Container element id.
 */
function bgContainer(id) {
    document.getElementById(id).classList.add("task-card-container-dragover");
}


/**
 * Remove dragover CSS class and hide the dashed placeholder for a container.
 * @param {string} id - Container element id.
 */
function bgContainerRemove(id) {
    hideDashedBox(id);
    document.getElementById(id).classList.remove("task-card-container-dragover");
}


/**
 * Returns HTML shown when a column has no tasks.
 * @param {string} section - Display name for empty state.
 * @returns {string} HTML string for the empty state.
 */
function getNoTaskTemplate(section) {
    return `<div class="no-tasks">No tasks ${section}</div>`;
}


/**
 * Show a dashed placeholder card in a column once during dragover.
 * Prevents duplicate placeholders for the same section while dragging.
 * @param {string} section - Column id where placeholder should appear.
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
 * Hide the dashed placeholder and restore the "no tasks" message.
 * @param {string} section - Column id.
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
 * Generate markup for the empty dashed card used during dragover.
 * @returns {string} HTML string for an empty card.
 */
function generateEmptyCard() {
    return `<div class="empty-card"></div>`;
}

/**
 * Open the task dialog for a given task id.
 * @param {string} index - The task id to open in the dialog.
 */
function openDialog(index) {
    let element = tasks.filter((t) => t["id"] === `${index}`)[0];
    dialogRef.classList.add("dialog-swipe-in");
    const dueDate = element["dueDate"] ? formatDate(element["dueDate"]) : "No due date set";
    dialogRef.innerHTML = getTemplateDialog(element, dueDate);
    initMembers(element["member"]);
    iniSubtasks(element["id"]);

    dialogRef.showModal();
}

/**
 * Close the currently open task dialog.
 */
function closeDialog() {
    dialogRef.classList.remove("dialog-swipe-in");
    dialogRef.close();
}

/**
 * Populate the dialog's assigned members section from an array of contact ids.
 * @param {Array<string>} memberIds - Array of contact ids assigned to the task.
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
function iniSubtasks(taskId) {
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
 * Add event listeners to subtask checkboxes
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
 * Create a new task and save it to Firebase
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
 * Add contact to task
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
 * Remove contact from task
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
 * Remove contact from all tasks (called when contact is deleted)
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
 * Update subtask completion status
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

// Also initialize immediately if the DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTasks);
} else {
    initializeTasks();
    openAddTaskAside();
}

// Make functions globally accessible for inline event handlers
window.openDialog = openDialog;
window.closeDialog = closeDialog;
window.startDragging = startDragging;
window.allowDrop = allowDrop;
window.handleDragOver = handleDragOver;
window.moveTo = moveTo;
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
window.SwipeInAddTaskAside = swipeInAddTaskAside;
window.SwipeOutAddTaskAside = swipeOutAddTaskAside;
window.createNewTask = createNewTask;
window.openAddTaskAside = openAddTaskAside;
window.addEventListener('resize', openAddTaskAside);
window.addEventListener('resize', updateSubtaskStatus);
