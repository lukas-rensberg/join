/**
 * @fileoverview Real-time input validation for the signup form.
 * Handles field-by-field validation on input, privacy checkbox warnings,
 * submit button state management, and error clearing.
 */

import {showFormError} from "./signup.js";
import {containsHtmlChars} from "./template.js";
import {validateEmailFormat} from "../utils/contact.js";

const HACK_ATTEMPT_MSG = "Want to hack me? Nah Ah! Remove HTML chars and \",\'";

/**
 * Checks if all text input fields are filled (excluding checkbox).
 * @returns {boolean} True if all text fields have values
 */
function areAllTextFieldsFilled() {
    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    return !!(username && email && password && confirmPassword);
}

/**
 * Checks if all required signup fields are filled, including the privacy checkbox.
 * @returns {boolean} True if all required fields are filled and checkbox is checked
 */
function areAllFieldsFilled() {
    const acceptedPolicy = document.getElementById("confirm-check")?.checked;
    return areAllTextFieldsFilled() && acceptedPolicy;
}

/**
 * Displays a privacy warning message next to the checkbox element.
 * @param {HTMLElement} checkbox - The privacy checkbox element
 * @returns {void}
 */
function showPrivacyWarning(checkbox) {
    checkbox.style.borderColor = "#ff4646";
    const warning = document.createElement("span");
    warning.className = "privacy-warning error-message";
    warning.textContent = "Please accept the Privacy Policy";
    checkbox.parentElement.appendChild(warning);
}

/**
 * Checks the privacy checkbox state and shows/hides the warning accordingly.
 * Shows warning when all text fields are filled but the checkbox is unchecked.
 * @returns {void}
 */
export function checkPrivacyWarning() {
    const checkbox = document.getElementById("confirm-check");
    if (!checkbox) return;

    const existingWarning = checkbox.parentElement.querySelector(".privacy-warning");

    if (areAllTextFieldsFilled() && !checkbox.checked) {
        if (!existingWarning) showPrivacyWarning(checkbox);
    } else {
        if (existingWarning) {
            existingWarning.remove();
            checkbox.style.borderColor = "";
        }
    }
}

/**
 * Checks if there are any validation error messages on the form.
 * @returns {boolean} True if there are error messages displayed
 */
function hasValidationErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    return errorMessages.length > 0;
}

/**
 * Updates the submit button's disabled state based on form completeness and errors.
 * @returns {void}
 */
export function updateSubmitButtonState() {
    const submitButton = document.querySelector('form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !areAllFieldsFilled() || hasValidationErrors();
    }
}

/**
 * Clears the validation error for a specific field by its ID.
 * Removes the red border and any error message element.
 * @param {string} fieldId - The ID of the input field
 * @returns {void}
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderBottom = "";
    const existingError = field.parentElement.querySelector(".error-message");
    if (existingError) existingError.remove();
}

/**
 * Validates a single field on input change and dispatches to specific validators.
 * @param {HTMLInputElement} input - The input element to validate
 * @returns {void}
 */
function validateFieldOnInput(input) {
    const value = input.value;
    const id = input.id;

    switch (id) {
        case "username":
            validateUsernameOnInput(value);
            break;
        case "email":
            validateEmailOnInput(value);
            break;
        case "signup-password":
            validatePasswordOnInput(value);
            validateConfirmPasswordOnInput();
            break;
        case "confirm-password":
            validateConfirmPasswordOnInput();
            break;
    }
}

/**
 * Validates the username field on input.
 * Shows error if name contains HTML chars or doesn't match "first last" pattern.
 * @param {string} username - The current username input value
 * @returns {void}
 */
function validateUsernameOnInput(username) {
    if (!username.trim()) return;

    if (containsHtmlChars(username)) {
        showFormError("username", HACK_ATTEMPT_MSG);
        return;
    }

    const nameRegex = /^\p{L}+\s\p{L}+$/u;
    if (username.trim().length > 2 && !nameRegex.test(username.trim())) {
        showFormError("username", "Please enter first and last name");
    }
}

/**
 * Validates the email field on input.
 * Shows error if email contains HTML chars or has invalid format.
 * @param {string} email - The current email input value
 * @returns {void}
 */
function validateEmailOnInput(email) {
    if (!email.trim()) return;

    if (containsHtmlChars(email)) {
        showFormError("email", HACK_ATTEMPT_MSG);
        return;
    }

    if (!validateEmailFormat(email)) {
        showFormError("email", "Invalid email format");
    }
}

/**
 * Validates the password field on input against security requirements.
 * Requires min 6 chars, lowercase, uppercase, digit, and special character.
 * @param {string} password - The current password input value
 * @returns {void}
 */
function validatePasswordOnInput(password) {
    if (!password) return;

    if (containsHtmlChars(password)) {
        showFormError("signup-password", HACK_ATTEMPT_MSG);
        return;
    }

    if (password.length >= 1 && (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password))) {
        showFormError("signup-password", `Insecure Password - <a href="https://www.bsi.bund.de/EN/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html" target="_blank" rel="noopener">BSI</a>`, true);
    }
}

/**
 * Validates the "confirm password" field on input.
 * Shows error if it contains HTML chars or doesn't match the password field.
 * @returns {void}
 */
function validateConfirmPasswordOnInput() {
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    if (!confirmPassword) return;

    if (containsHtmlChars(confirmPassword)) {
        showFormError("confirm-password", HACK_ATTEMPT_MSG);
        return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
        showFormError("confirm-password", "Passwords do not match");
    }
}

/**
 * Handles input change events for form fields.
 * Clears existing errors, re-validates the field, checks privacy warning, and updates button state.
 * @param {Event} event - The input change event
 * @returns {void}
 */
export function handleInputChange(event) {
    const input = event.target;
    clearFieldError(input.id);
    validateFieldOnInput(input);
    checkPrivacyWarning();
    updateSubmitButtonState();
}

/**
 * Sets up the change event listener for the privacy checkbox.
 * Updates privacy warning and submit button state on change.
 * @returns {void}
 */
export function setupCheckboxChangeListener() {
    const checkbox = document.getElementById("confirm-check");
    if (checkbox) checkbox.addEventListener("change", () => {
        checkPrivacyWarning();
        updateSubmitButtonState();
    });
}

