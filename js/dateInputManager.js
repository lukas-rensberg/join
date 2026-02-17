import { calendarJs } from "./calendar.min.js"

/**
 * Date Input Management Functions
 * Handles date input formatting and validation with scoped container support
 */

/**
 * Initializes the date input field
 * Adds automatic formatting for dd/mm/yyyy
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 */
export function initializeDateInput(container) {
    const dateInput = container.querySelector('.date-input-hidden');
    if (dateInput) {
        new calendarJs( "calendar", {
            views: {
                datePicker: {
                    selectedDateFormat: "{dd}/{mm}/{yyyy}",
                    minimumDate: new Date()
                }
            }
        } );
    }
}

/**
 * Validates the date input
 * @param {string} dateString - The date string in dd/mm/yyyy format
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDate(dateString) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 &&
        date.getDate() === day && date >=
        new Date(new Date().setHours(0, 0, 0, 0));
}
