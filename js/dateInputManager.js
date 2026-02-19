import {calendarJs} from "./calendar.min.js"

/**
 * Date Input Management Functions
 * Handles date input formatting and validation with scoped container support
 */

let calendarCounter = 0;

/**
 * Initializes the date input field
 * Adds automatic formatting for dd/mm/yyyy
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 */
export function initializeDateInput(container) {
    const dateInput = container.querySelector('.date-input-hidden');
    if (!dateInput) return;

    if (!dateInput.id) dateInput.id = `calendar-${calendarCounter++}`;
    container.querySelector('.calendar-icon')?.setAttribute('for', dateInput.id);

    let convertedValue = null;
    if (dateInput.value && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) {
        const [year, month, day] = dateInput.value.split('-');
        convertedValue = `${day}/${month}/${year}`;
    }

    new calendarJs(dateInput.id, {
        views: {
            datePicker: {
                selectedDateFormat: "{dd}/{mm}/{yyyy}",
                minimumDate: new Date()
            }
        }
    });

    if (convertedValue) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dateInput.value = convertedValue;
                dateInput.dispatchEvent(new Event('input', {bubbles: true}));
                dateInput.dispatchEvent(new Event('change', {bubbles: true}));
            })
        });
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
