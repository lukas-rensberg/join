/**
 * @fileoverview Signup page functionality including form submission handling,
 * submit-time validation, success message display, and event setup.
 * Real-time input validation is delegated to signupValidation.js.
 */

import {validateEmailFormat} from "../utils/contact.js";
import {updatePasswordIcon, togglePasswordVisibility} from "./login.js";
import {containsHtmlChars} from "./template.js";
import {handleInputChange, updateSubmitButtonState, setupCheckboxChangeListener} from "./signupValidation.js";

const HACK_ATTEMPT_MSG = "Want to hack me? Nah Ah! Remove HTML chars and \",\'";

/**
 * Clears all error messages and red borders from form inputs.
 * @returns {void}
 */
function clearFormErrors() {
    const existingError = document.querySelector(".auth-error-message");
    if (existingError) existingError.remove();

    document.querySelectorAll(".error-message").forEach(error => error.remove());

    const form = document.querySelector("form");
    if (form) {
        const formInputs = form.querySelectorAll('input[type="password"], input[type="text"], input[type="email"]');
        const checkbox = document.getElementById("confirm-check");
        formInputs.forEach(input => {
            input.style.borderBottom = "";
        });
        if (!checkbox) return;
        checkbox.style.borderColor = "";
    }
}

/**
 * Shows a form validation error for a specific field.
 * @param {string} fieldId - The ID of the input field
 * @param {string} message - The error message to display
 * @param {boolean} [isHtml=false] - Whether the message contains HTML
 * @returns {void}
 */
export function showFormError(fieldId, message, isHtml = false) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderBottom = "1px solid #ff4646";

    const existingError = field.parentElement.querySelector(".error-message");
    if (existingError) existingError.remove();

    const errorMsg = document.createElement("span");
    errorMsg.className = "error-message";
    if (isHtml) {
        errorMsg.innerHTML = message;
    } else {
        errorMsg.textContent = message;
    }
    field.parentElement.appendChild(errorMsg);
}

/**
 * Shows an error message for the privacy policy checkbox.
 * @returns {boolean} Always returns false to indicate validation failure
 */
function showPolicyError() {
    const checkbox = document.getElementById("confirm-check");
    checkbox.parentElement.querySelector(".error-message")?.remove();
    checkbox.style.borderColor = "#ff4646";
    const errorMsg = document.createElement("span");
    errorMsg.className = "error-message";
    errorMsg.textContent = "Please accept the Privacy Policy";
    checkbox.parentElement.appendChild(errorMsg);
    return false;
}

/**
 * Validates the complete signup form fields and shows errors if invalid.
 * @param {string} username - The username value
 * @param {string} email - The email value
 * @param {string} password - The password value
 * @param {string} confirmPassword - The confirm password value
 * @param {boolean} acceptedPolicy - Whether the privacy policy was accepted
 * @returns {boolean} True if the form is valid
 */
function validateSignupForm(username, email, password, confirmPassword, acceptedPolicy) {
    clearFormErrors();

    if (!validatePasswordField(password, confirmPassword)) return false;
    if (!validateUsernameAndEmail(username, email)) return false;
    if (!acceptedPolicy) return showPolicyError();

    return true;
}

/**
 * Validates the username field (first and last name required).
 * @param {string} username - The username to validate
 * @returns {boolean} True if valid
 */
function validateUsername(username) {
    const nameRegex = /^\p{L}+\s\p{L}+$/u;

    if (!username.trim()) {
        showFormError("username", "Full name is required");
        return false;
    }
    if (containsHtmlChars(username)) {
        showFormError("username", HACK_ATTEMPT_MSG);
        return false;
    }
    if (!nameRegex.test(username.trim())) {
        showFormError("username", "Please enter first and last name");
        return false;
    }
    return true;
}

/**
 * Validates the email field format and content.
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
    if (!email.trim()) {
        showFormError("email", "Email is required");
        return false;
    }
    if (containsHtmlChars(email)) {
        showFormError("email", HACK_ATTEMPT_MSG);
        return false;
    }
    if (!validateEmailFormat(email)) {
        showFormError("email", "Invalid email format");
        return false;
    }
    return true;
}

/**
 * Validates both username and email fields and shows errors if invalid.
 * @param {string} username - The username to validate
 * @param {string} email - The email to validate
 * @returns {boolean} True if both are valid
 */
function validateUsernameAndEmail(username, email) {
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    return isUsernameValid && isEmailValid;
}

/**
 * Validates password and confirm password fields.
 * Firebase requirements: lowercase, uppercase, digit, non-alphanumeric character.
 * @param {string} password - The password to validate
 * @param {string} confirmPassword - The confirmation password to validate
 * @returns {boolean} True if both passwords are valid
 */
function validatePasswordField(password, confirmPassword) {
    let isValid = true;

    validateUserPassword(password);
    confirmUserPassword(confirmPassword);

    return isValid;
}

/**
 * Validates the user password against security requirements.
 * @param {string} password - The password to validate
 * @returns {boolean} True if password is valid, false otherwise
 */
function validateUserPassword(password) {
    let isValid = true;
    if (!password) {
        showFormError("signup-password", "Password is required");
        isValid = false;
    } else if (containsHtmlChars(password)) {
        showFormError("signup-password", HACK_ATTEMPT_MSG);
        isValid = false;
    } else if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        showFormError("signup-password", `Insecure Password - <a href="https://www.bsi.bund.de/EN/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html" target="_blank" rel="noopener">BSI</a>`, true);
        isValid = false;
    }
    return isValid;
}

/**
 * Validates the confirmation password field matches the original password.
 * @param {string} confirmPassword - The confirmation password to validate
 * @returns {boolean} True if confirmation password is valid and matches, false otherwise
 */
function confirmUserPassword(confirmPassword) {
    let isValid = true;
    if (!confirmPassword) {
        showFormError("confirm-password", "Please confirm your password");
        isValid = false;
    } else if (containsHtmlChars(confirmPassword)) {
        showFormError("confirm-password", HACK_ATTEMPT_MSG);
        isValid = false;
    } else if (password !== confirmPassword) {
        showFormError("confirm-password", "Passwords do not match");
        isValid = false;
    }
    return isValid;
}

/**
 * Shows a success message after signup.
 * Displays for 800ms then redirects to the login page (no auto-login).
 * @returns {void}
 */
export function showSuccessMessage() {
    const successDialog = document.getElementById("signupSuccess");
    if (!successDialog) return;

    successDialog.showModal();

    setTimeout(() => {
        successDialog.close();
        window.location.href = "index.html";
    }, 800);
}

/**
 * Initializes signup page functionality.
 * Sets up input listeners, checkbox listener, password toggles, and form submission.
 * @param {Function} signupUserCallback - Callback function to handle user signup logic
 * @param {Function} handleAuthErrorCallback - Callback function to handle authentication errors
 * @returns {void}
 */
export function initSignupPage(signupUserCallback, handleAuthErrorCallback) {
    const signupForm = document.querySelector("form");
    const usernameInput = document.querySelector('input[name="username"]');
    if (!signupForm || !usernameInput) return;
    updateSubmitButtonState();

    setupInputChangeListeners(signupForm);
    setupCheckboxChangeListener();

    document.querySelectorAll(".password-icon-toggle").forEach(toggle => setupPasswordToggle(toggle));

    signupForm.addEventListener("submit", async event => {
        event.preventDefault();
        await handleFormSubmit(signupUserCallback, handleAuthErrorCallback);
    });
}

/**
 * Sets up input change event listeners for all text, email and password fields.
 * @param {HTMLFormElement} form - The form element containing the inputs
 * @returns {void}
 */
function setupInputChangeListeners(form) {
    const inputs = form.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"]'
    );
    inputs.forEach(input => input.addEventListener("input", handleInputChange));
}

/**
 * Sets up password visibility toggle functionality for a toggle element.
 * @param {HTMLElement} toggle - The toggle element with data-target attribute
 * @returns {void}
 */
function setupPasswordToggle(toggle) {
    const targetId = toggle.dataset.target;
    const passwordInput = document.getElementById(targetId);
    if (!passwordInput) return;

    passwordInput.addEventListener("input", () => updatePasswordIcon(passwordInput, toggle));
    toggle.addEventListener("click", () => togglePasswordVisibility(toggle));
}

/**
 * Handles the signup form submission by validating inputs and calling the signup callback.
 * @param {Function} signupUserCallback - Callback function to handle user signup
 * @param {Function} handleAuthErrorCallback - Callback function to handle authentication errors
 * @returns {Promise<void>}
 */
async function handleFormSubmit(signupUserCallback, handleAuthErrorCallback) {
    const username = document.querySelector('input[name="username"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
    const acceptedPolicy = document.getElementById("confirm-check").checked;

    const valid = validateSignupForm(username, email, password, confirmPassword, acceptedPolicy);
    if (!valid) return;

    try {
        await signupUserCallback(email, password, username);
        showSuccessMessage();
    } catch (error) {
        handleAuthErrorCallback(error, "signup");
    }
}
