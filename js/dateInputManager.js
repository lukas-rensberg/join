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

    // Convert YYYY-MM-DD → dd/mm/yyyy BEFORE calendarJs init so it can parse with split("/")
    let formattedDate = '';
    if (dateInput.value && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) {
        const [year, month, day] = dateInput.value.split('-');
        formattedDate = `${day}/${month}/${year}`;
        dateInput.value = formattedDate;
    } else if (dateInput.value && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.value)) {
        formattedDate = dateInput.value;
    }

    const calendarOptions = {
        views: {
            datePicker: {
                selectedDateFormat: "{dd}/{mm}/{yyyy}",
            }
        },
        events: {}
    };

    if (!options.allowPastDates) {
        calendarOptions.views.datePicker.minimumDate = new Date();
    }

    if (typeof options.onDateChanged === 'function') {
        calendarOptions.events.onDatePickerDateChanged = options.onDateChanged;
    }

    new calendarJs(dateInput.id, calendarOptions);

    // After CalendarJS init, sync the value to the visible input it creates
    if (formattedDate) {
        const visibleInput = container.querySelector('.calendar-date-picker-input');
        if (visibleInput) {
            visibleInput.value = formattedDate;
        }
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
