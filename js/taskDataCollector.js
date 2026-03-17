import { getSelectedPriority } from "./priorityManager.js";
import { getSelectedCategory, getSelectedContacts } from "./dropdownManager.js";
import { getSubtasks } from "./subtaskManager.js";

/**
 * Collects all task data from the form
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @param {string} [targetCategory='to-do'] - The target category/column for the new task
 * @returns {Object} Task data object
 */
export function collectTaskData(container, targetCategory = 'to-do') {
    return {
        title: getTaskTitle(container),
        text: getTaskDescription(container),
        dueDate: getFormattedDueDate(container),
        priority: getSelectedPriority(container),
        task: getSelectedCategory()?.name || '',
        category: targetCategory,
        member: getAssignedMemberIds(),
        subtasks: getSubtaskTexts(container)
    };
}

/**
 * Collects task data for editing, preserving done status of unchanged subtasks
 * @param {HTMLElement} container - The container element to scope queries
 * @param {Object} originalTask - The original task object with subtasks and subtasks_done
 * @returns {Object} Task data object with properly categorized subtasks
 */
export function collectEditTaskData(container, originalTask) {
    const newSubtaskTexts = getSubtaskTexts(container);
    const originalDone = originalTask.subtasks_done || [];
    const subtasksDone = newSubtaskTexts.filter(text => originalDone.includes(text));
    const subtasks = newSubtaskTexts.filter(text => !originalDone.includes(text));

    return {
        title: getTaskTitle(container),
        text: getTaskDescription(container),
        dueDate: getFormattedDueDate(container),
        priority: getSelectedPriority(container),
        task: getSelectedCategory()?.name || '',
        member: getAssignedMemberIds(),
        subtasks: subtasks,
        subtasks_done: subtasksDone
    };
}

/**
 * Gets the task title from form
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string} Task title
 */
export function getTaskTitle(container) {
    return container.querySelector('.input-title')?.value?.trim() || '';
}

/**
 * Gets the task description from form
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string} Task description
 */
export function getTaskDescription(container) {
    return container.querySelector('.task-description')?.value?.trim() || '';
}

/**
 * Gets and formats the due date to ISO format.
 * Reads from the visible CalendarJS input (dd/mm/yyyy) and converts to YYYY-MM-DD for Firebase.
 * Falls back to the hidden input if the visible one is not available.
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string} ISO formatted date (YYYY-MM-DD) or empty string
 */
export function getFormattedDueDate(container) {
    const visibleInput = container.querySelector('.calendar-date-picker-input');
    const dueDate = visibleInput?.value || container.querySelector('.date-input-hidden')?.value;
    if (!dueDate) return '';

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dueDate)) {
        const [day, month, year] = dueDate.split('/');
        return `${year}-${month}-${day}`;
    }
    return dueDate;
}

/**
 * Gets assigned contact IDs
 * @returns {string[]} Array of contact IDs
 */
export function getAssignedMemberIds() {
    const assignedContacts = getSelectedContacts();
    return assignedContacts.map(contact => contact.id);
}

/**
 * Gets subtask texts as array
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {string[]} Array of subtask texts
 */
export function getSubtaskTexts(container) {
    const subtasks = getSubtasks(container);
    return subtasks.map(subtask => subtask.text);
}
