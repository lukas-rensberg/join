/**
 * Task Data Collection Functions
 * Handles collecting and formatting task data from form
 */

import { getSelectedPriority } from "./priority-manager.js";
import { getSelectedCategory, getSelectedContacts } from "./dropdown-manager.js";
import { getSubtasks } from "./subtask-manager.js";

/**
 * Collects all task data from the form
 * @returns {Object} Task data object
 */
export function collectTaskData() {
    return {
        title: getTaskTitle(),
        text: getTaskDescription(),
        dueDate: getFormattedDueDate(),
        priority: getSelectedPriority(),
        task: getSelectedCategory().name,
        category: 'to-do',
        member: getAssignedMemberIds(),
        subtasks: getSubtaskTexts()
    };
}

/**
 * Gets the task title from form
 * @returns {string} Task title
 */
export function getTaskTitle() {
    return document.querySelector('.task-title')?.value?.trim() || '';
}

/**
 * Gets the task description from form
 * @returns {string} Task description
 */
export function getTaskDescription() {
    return document.querySelector('.task-description')?.value?.trim() || '';
}

/**
 * Gets and formats the due date to ISO format
 * @returns {string} ISO formatted date (YYYY-MM-DD)
 */
export function getFormattedDueDate() {
    const dueDate = document.getElementById('dueDate')?.value;
    const [day, month, year] = dueDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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
 * @returns {string[]} Array of subtask texts
 */
export function getSubtaskTexts() {
    const subtasks = getSubtasks();
    return subtasks.map(subtask => subtask.text);
}

