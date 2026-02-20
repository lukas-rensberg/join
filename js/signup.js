import {validateEmailFormat} from "../utils/contact.js";
import {updatePasswordIcon, togglePasswordVisibility} from "./login.js";
import {containsHtmlChars} from "./template.js";

const HACK_ATTEMPT_MSG = "Want to hack me? Nah Ah! Remove HTML chars and \",\'";

/**
 * Clear error messages and red borders from form inputs
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
            input.style.borderBottom = ""
        });
        if (!checkbox) return;
        checkbox.style.borderColor = "";
    }
}

/**
 * Show form validation error for a specific field
 * @param {string} fieldId The ID of the input field
 * @param {string} message The error message to display
 * @param {boolean} isHtml Whether the message contains HTML (default: false)
 */
function showFormError(fieldId, message, isHtml = false) {
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
 * Check if all text input fields are filled (excluding checkbox)
 * @returns {boolean} True if all text fields are filled
 */
function areAllTextFieldsFilled() {
    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    return !!(username && email && password && confirmPassword);
}

/**
 * Check if all required signup fields are filled
 * @returns {boolean} True if all required fields are filled
 */
function areAllFieldsFilled() {
    const acceptedPolicy = document.getElementById("confirm-check")?.checked;
    return areAllTextFieldsFilled() && acceptedPolicy;
}

/**
 * Display privacy warning message next to checkbox
 * @param {HTMLElement} checkbox - The privacy checkbox element
 */
function showPrivacyWarning(checkbox) {
    checkbox.style.borderColor = "#ff4646";
    const warning = document.createElement("span");
    warning.className = "privacy-warning error-message";
    warning.textContent = "Please accept the Privacy Policy";
    checkbox.parentElement.appendChild(warning);
}

/**
 * Check privacy checkbox state and show warning if all fields filled but checkbox unchecked
 */
function checkPrivacyWarning() {
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
 * Check if there are any validation errors on the form
 * @returns {boolean} True if there are errors
 */
function hasValidationErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    return errorMessages.length > 0;
}

/**
 * Update the submit button state based on form completeness and errors
 */
function updateSubmitButtonState() {
    const submitButton = document.querySelector('form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !areAllFieldsFilled() || hasValidationErrors();
    }
}

/**
 * Show error message for privacy policy checkbox
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
 * Validate signup form fields and show errors if invalid
 * @param username
 * @param email
 * @param password
 * @param confirmPassword
 * @param acceptedPolicy
 * @returns {boolean}
 */
function validateSignupForm(username, email, password, confirmPassword, acceptedPolicy) {
    clearFormErrors();

    if (!validatePasswordField(password, confirmPassword)) return false;
    if (!validateUsernameAndEmail(username, email)) return false;
    if (!acceptedPolicy) return showPolicyError();

    return true;
}

/**
 * Validate username field (first and last name required)
 * @param {string} username
 * @returns {boolean}
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
 * Validate email field
 * @param {string} email
 * @returns {boolean}
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
 * Validate username and email fields and show errors if invalid
 * @param {string} username
 * @param {string} email
 * @returns {boolean}
 */
function validateUsernameAndEmail(username, email) {
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    return isUsernameValid && isEmailValid;
}

/**
 * Validate password and confirm password fields and show errors if invalid
 * Firebase requirements: lowercase, uppercase, non-alphanumeric character
 * @param password
 * @param confirmPassword
 * @returns {boolean}
 */
function validatePasswordField(password, confirmPassword) {
    let isValid = true;

    validateUserPassword(password);
    confirmUserPassword(confirmPassword);

    return isValid;
}

/**
 * Validates the user password against security requirements
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
 * Validates the confirmation password field matches the original password
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
 * Show success message after signup (signup page)
 * Shows for 800ms then redirects to login page (no auto-login)
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
 * Initialize signup page functionality (signup page)
 * @param {function} signupUserCallback - Callback function to handle user signup logic
 * @param {function} handleAuthErrorCallback - Callback function to handle authentication errors
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
 * Sets up input change event listeners for all text, email and password fields
 * @param {HTMLFormElement} form - The form element containing the inputs
 */
function setupInputChangeListeners(form) {
    const inputs = form.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"]'
    );
    inputs.forEach(input => input.addEventListener("input", handleInputChange));
}

/**
 * Sets up the change event listener for the privacy checkbox
 */
function setupCheckboxChangeListener() {
    const checkbox = document.getElementById("confirm-check");
    if (checkbox) checkbox.addEventListener("change", () => {
        checkPrivacyWarning();
        updateSubmitButtonState();
    });
}

/**
 * Handles input change events for form fields by clearing errors, validating, and updating button state
 * @param {Event} event - The input change event
 * @returns {void}
 */
function handleInputChange(event) {
    const input = event.target;
    clearFieldError(input.id);
    validateFieldOnInput(input);
    checkPrivacyWarning();
    updateSubmitButtonState();
}

/**
 * Clear error for a specific field
 * @param {string} fieldId The ID of the input field
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderBottom = "";
    const existingError = field.parentElement.querySelector(".error-message");
    if (existingError) existingError.remove();
}

/**
 * Validate a single field on input
 * @param {HTMLInputElement} input The input element to validate
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
 * Validate username field on input
 * @param {string} username
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
 * Validate email field on input
 * @param {string} email
 */
function validateEmailOnInput(email) {
    if (!email.trim()) return;

    if (containsHtmlChars(email)) {
        showFormError("email", HACK_ATTEMPT_MSG);
        return;
    }

    if (!validateEmailFormat(email)) {showFormError("email", "Invalid email format");}
}

/**
 * Validate password field on input
 * @param {string} password
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
 * Validate confirm password field on input
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
 * Sets up password visibility toggle functionality for a toggle element
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
 * Handles the signup form submission by validating inputs and calling signup callback
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
