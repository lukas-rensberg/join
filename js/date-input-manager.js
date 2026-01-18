/**
 * Date Input Management Functions
 * Handles date input formatting and validation with scoped container support
 */

/**
 * Initializes the date input field
 * Adds automatic formatting for dd/mm/yyyy
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 */
export function initializeDateInput(container = document) {
    const dateInput = container.querySelector('.due-date-input');
    if (dateInput) {
        dateInput.addEventListener('input', formatDateInput);
        dateInput.addEventListener('keydown', handleDateKeydown);
    }
}

/**
 * Formats the date input to dd/mm/yyyy format
 * Automatically adds slashes
 * @param {Event} event - The input event
 */
function formatDateInput(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove all non-numeric characters

    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
        value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }

    input.value = value;
}

/**
 * Handles keydown events for the date input
 * Allows proper backspace functionality
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleDateKeydown(event) {
    const input = event.target;

    if (event.key === 'Backspace') {
        const cursorPosition = input.selectionStart;
        const value = input.value;

        if (cursorPosition > 0 && value[cursorPosition - 1] === '/') {
            event.preventDefault();
            input.value = value.substring(0, cursorPosition - 2) + value.substring(cursorPosition);
            input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
        }
    }
}

/**
 * Validates the date input
 * @param {string} dateString - The date string in dd/mm/yyyy format
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDate(dateString) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return false;
    }

    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date >= new Date(new Date().setHours(0, 0, 0, 0));
}
