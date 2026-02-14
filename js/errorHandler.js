/**
 * Error Handler Module - Handles authentication and form validation errors with scoped container support
 */

/**
 * Create error message element for authentication errors
 * @param {string} message - The error message to display
 * @returns {HTMLElement} The error message div element
 */
export function createAuthErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "auth-error-message";
    errorDiv.textContent = message;
    return errorDiv;
}

/**
 * Show error message below form fields (for auth forms)
 */
export function showErrorMessage(message) {
    const existingError = document.querySelector(".auth-error-message");
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = createAuthErrorMessage(message);

    const form = document.querySelector("form");
    if (!form) return;
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.style.borderBottom = "0.06rem solid #ff0000";
    });

    const buttonContainer = form.querySelector(".button-container");
    if (buttonContainer) form.insertBefore(errorDiv, buttonContainer);
    else form.appendChild(errorDiv);
}

/**
 * Alias for showErrorMessage (for inline errors)
 */
export const showInlineError = showErrorMessage;

/**
 * Handle authentication errors (login page, signup page, protected pages)
 */
export function handleAuthError(error) { showErrorMessage(getErrorMessage(error)); }

/**
 * Map Firebase authentication error codes to user-friendly messages
 * @param error - The error object from Firebase authentication
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
    if (error.code === "auth/invalid-email") {
        return "Invalid email address."
    } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        return "Check your email and password. Please try again.";
    } else if ("auth/too-many-requests") {
        return "Too many failed attempts. Please try again later.";
    } else if (error.code === "auth/email-already-in-use") {
        return "This email is already registered."
    } else if (error.code === "auth/weak-password") {
        return "Password is too weak. Please use a stronger password.";
    } else {
        return error.message.toString();
    }
}

/**
 * Show field-specific error message below a form field
 * @param {string} fieldName - Name of the field (e.g., 'title', 'dueDate', 'category')
 * @param {string} message - Error message to display
 * @param {HTMLElement|Document} container - The container element to scope queries (default: document)
 * @return {void}
 */
export function showFieldError(fieldName, message, container) {
    const { formGroup, inputElement } = getFieldElements(fieldName, container);
    if (!formGroup) return;
    formGroup.querySelector('.field-error')?.remove();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error visible';
    errorDiv.textContent = message;
    if (inputElement) setBorderColor(fieldName, inputElement, '#ff3d00');
    formGroup.appendChild(errorDiv);
    formGroup.classList.add('has-error');
}

function getFieldElements(fieldName, container) {
    if (fieldName === 'title') {
        const formGroup = container.querySelector('.form-group-title');
        return { formGroup, inputElement: formGroup?.querySelector('.input-title') };
    }
    if (fieldName === 'description') {
        const inputElement = container.querySelector('.task-description');
        return { formGroup: inputElement?.closest('.form-group'), inputElement };
    }
    const selector = fieldName === 'dueDate' ? '.due-date-input' : '.category-dropdown-wrapper';
    const inputElement = container.querySelector(selector);
    return { formGroup: inputElement?.closest('.form-group'), inputElement };
}

function setBorderColor(fieldName, element, color) {
    const target = fieldName === 'category' ? element.querySelector('.dropdown-header')
        : fieldName === 'dueDate' ? element.closest('.input-with-icon') : element;
    if (target) target.style[fieldName === 'category' ? 'borderBottomColor' : 'borderColor'] = color;
}

/**
 * Clear error for a specific field
 * @param {string} fieldName - Name of the field
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @return {void}
 */
export function clearFieldError(fieldName, container) {
    const { formGroup, inputElement } = getFieldElements(fieldName, container);
    if (formGroup) {
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) errorElement.remove();
        if (inputElement) {
            if (fieldName === 'category') {
                const dropdownHeader = inputElement.querySelector('.dropdown-header');
                if (dropdownHeader) dropdownHeader.style.borderBottomColor = '';
            } else if (fieldName === 'dueDate') {
                const inputWrapper = inputElement.closest('.input-with-icon');
                if (inputWrapper) inputWrapper.style.borderColor = '';
            } else inputElement.style.borderColor = '';
        }
        formGroup.classList.remove('has-error');
    }
}

/**
 * Clear all field errors
 * @param {HTMLElement|Document} container - The container element to scope queries (default: document)
 * @return {void}
 */
export function clearAllFieldErrors(container = document) {
    executeOnHTMLElement(container, '.field-error', element => element.remove());
    executeOnHTMLElement(container, '.form-group', group => group.classList.remove('has-error'));
    executeOnHTMLElement(container, '.input-title, .due-date-input',input => input.style.borderColor = '');
    executeOnHTMLElement(container, '.input-with-icon', wrapper => wrapper.style.borderColor = '');
    executeOnHTMLElement(container, '.dropdown-header', header => header.style.borderBottomColor = '');
}

function executeOnHTMLElement(container, selector, callback) {
    if (container) container.querySelectorAll(selector).forEach(callback);
    document.querySelectorAll(selector).forEach(callback);
}

/**
 * Show success banner at the top of the page
 * @return {void}
 */
export function showSuccessBanner() {
    clearAllFieldErrors();

    let successBanner = document.getElementById("taskAdded")
    if (!successBanner) return;
    successBanner.classList.add('move-animation-add-task');
    setTimeout(() => successBanner.classList.remove('move-animation-add-task'), 1000);
}

/**
 * Show error banner at the top of the page
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in milliseconds (default: 4000)
 * @return {void}
 */
export function showErrorBanner(message = 'An error occurred', duration = 4000) {
    let errorBanner = document.querySelector('.error-banner');

    if (!errorBanner) {
        errorBanner = document.createElement('div');
        errorBanner.className = 'error-banner';
        document.body.appendChild(errorBanner);
    }

    errorBanner.textContent = message;
    errorBanner.classList.add('visible');

    setTimeout(() => {
        errorBanner.classList.remove('visible');
    }, duration);
}
