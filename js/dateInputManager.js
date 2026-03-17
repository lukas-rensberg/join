import {calendarJs} from "./calendar.min.js"

let calendarCounter = 0;

/**
 * Initializes the date input field with calendar.js date picker.
 * Converts any pre-set YYYY-MM-DD value to dd/mm/yyyy before calendarJs init,
 * since calendarJs internally parses the hidden input value with split("/").
 * @param {HTMLElement} container - The container element to scope queries
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.allowPastDates=false] - Whether to allow selecting past dates (useful for editing existing tasks)
 * @param {Function} [options.onDateChanged] - Callback fired when a date is selected via the picker
 */
export function initializeDateInput(container, options = {}) {
    const dateInput = container.querySelector('.date-input-hidden');
    if (!dateInput) return;

    if (!dateInput.id) dateInput.id = `calendar-${calendarCounter++}`;
    container.querySelector('.calendar-icon')?.setAttribute('for', dateInput.id);
    const formattedDate = getFormattedCalendarDate(dateInput.value)

    initCalendarJs(dateInput.id, options.allowPastDates, options.onDateChanged);
    if (formattedDate) {
        const visibleInput = container.querySelector('.calendar-date-picker-input');
        if (visibleInput) {
            visibleInput.value = formattedDate;
        }
    }
}

/**
 * Initializes the calendar.js date picker on the specified input element with given options.
 * @param {String} inputId - The ID of the hidden input element to attach the calendar to
 * @param {boolean} allowPastDates - Whether to allow selecting past dates
 * @param {Function} onDateChanged - Callback fired when a date is selected via the picker
 */
function initCalendarJs(inputId, allowPastDates, onDateChanged) {
    const calendarOptions = {
        views: {
            datePicker: {
                selectedDateFormat: "{dd}/{mm}/{yyyy}",
            }
        },
        events: {}
    };

    if (!allowPastDates) calendarOptions.views.datePicker.minimumDate = new Date();
    if (typeof onDateChanged === 'function') {
        calendarOptions.events.onDatePickerDateChanged = onDateChanged;
    }

    new calendarJs(inputId, calendarOptions);
}

/**
 * Formats the date from YYYY-MM-DD to dd/mm/yyyy for calendarJs compatibility.
 * @param {string} value - The date string in either YYYY-MM-DD or dd/mm/yyyy format
 * @returns {string} - The formatted date string in dd/mm/yyyy format
 */
function getFormattedCalendarDate(value) {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }
    return value;
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
