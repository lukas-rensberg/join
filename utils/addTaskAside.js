import {getTemplateAddTask} from "../js/template.js";
import {initializeDateInput} from "../js/dateInputManager.js";
import {initializePriorityButtons} from "../js/priorityManager.js";
import {initializeDropdowns, resetDropdownState} from "../js/dropdownManager.js";
import {initializeSubtasks, resetSubtaskInitialization} from "../js/subtaskManager.js";
import {handleCreateTaskFromBoard} from "../js/addTask.js";
import {isDesktop} from "./mediaQuerySwitch.js";

let addTaskRef = document.getElementById("aside-add-task");
let addedTaskRef = document.getElementById("taskAdded");
let targetCategory = 'to-do';

/**
 * Returns the currently selected target category for new tasks.
 * @returns {string} The category ID ('to-do', 'in-progress', 'await-feedback')
 */
export function getTargetCategory() {
    return targetCategory;
}

/**
 * Sets the target category for the next task to be created.
 * @param {string} category - The category ID ('to-do', 'in-progress', 'await-feedback')
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
export function swipeOutAddTaskAside() {
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
 * On smaller screens, redirects to the addTask.html page with category parameter.
 * Sets up event listeners for opening and closing the add task interface.
 * Reads data-category attribute from clicked icon to set target category.
 * @returns {void}
 */
export function openAddTaskAside() {
    const openIcons = document.querySelectorAll('.add-task-icon');
    const addTaskBtn = document.querySelector('.add-task-btn');

    openIcons.forEach(icon => {
        getCategorySwitchEventListener(icon);
    });

    if (!addTaskBtn) return;
    addTaskButtonHandler(addTaskBtn)
    closeAddTaskAside()
}


/**
 * Attaches click event listener to category switch icons.
 * On click, sets the target category based on the icon's data-category attribute.
 * Opens the add task interface appropriate for the device screen size (aside panel for desktop, redirect for mobile).
 * @param {HTMLElement} icon - The DOM element representing the category switch icon, expected to have a data-category attribute.
 * @returns {void}
 */
function getCategorySwitchEventListener(icon) {
    icon.addEventListener('click', () => {
        const category = icon.dataset.category || 'to-do';
        setTargetCategory(category);
        if (!isDesktop()) return window.location.href = `addTask.html?category=${category}`;
        createAddTask();
        swipeInAddTaskAside();
    });
}

/**
 * Attaches click event listener to the main add task button.
 * On click, sets the target category to 'to-do' by default and opens the add task aside panel on desktop.
 * On mobile, it can redirect to the addTask.html page or handle differently as needed.
 * @param {HTMLElement} addTaskBtn - The DOM element representing the main add task button.
 * @returns {void}
 */
function addTaskButtonHandler(addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        setTargetCategory('to-do');
        if (isDesktop()) {
            createAddTask();
            swipeInAddTaskAside();
        }
    })
}

/**
 * Attaches click event listener to the close button of the add task aside panel.
 * On click, triggers the swipe-out animation to close the aside panel.
 * Also sets up the create button event listener for the add task form.
 * @returns {void}
 */
function closeAddTaskAside() {
    const closeButton = document.querySelector('.close-add-task');
    if (closeButton) closeButton.addEventListener('click', swipeOutAddTaskAside);
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
    refAddTask.innerHTML = getTemplateAddTask();

    initializeDateInput(dialogElement);
    initializePriorityButtons(dialogElement);
    resetDropdownState();
    initializeDropdowns(dialogElement, dialogElement);
    resetSubtaskInitialization(dialogElement);
    initializeSubtasks(dialogElement);
}