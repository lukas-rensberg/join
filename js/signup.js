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
        formInputs.forEach(input => { input.style.borderBottom = "" });

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
 * Check if all required signup fields are filled
 * @returns {boolean} True if all required fields are filled
 */
function areAllFieldsFilled() {
    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;
    const acceptedPolicy = document.getElementById("confirm-check")?.checked;

    return !!(username && email && password && confirmPassword && acceptedPolicy);
}

/**
 * Update the submit button state based on form completeness
 */
function updateSubmitButtonState() {
    const submitButton = document.querySelector('form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !areAllFieldsFilled();
    }
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
    if (!acceptedPolicy) {
        const checkbox = document.getElementById("confirm-check");
        checkbox.parentElement.querySelector(".error-message")?.remove();
        checkbox.style.borderColor = "#ff4646";
        const errorMsg = document.createElement("span");
        errorMsg.className = "error-message";
        errorMsg.textContent = "Please accept the Privacy Policy";
        checkbox.parentElement.appendChild(errorMsg);

        return false;
    }

    return true;
}

/**
 * Validate username and email fields and show errors if invalid
 * @param username
 * @param email
 * @returns {boolean}
 */
function validateUsernameAndEmail(username, email) {
    let isValid = true;
    const nameRegex = /^\p{L}+\s\p{L}+$/u;

    if (!username.trim()) {
        showFormError("username", "Full name is required");
        isValid = false;
    } else if (containsHtmlChars(username)) {
        showFormError("username", HACK_ATTEMPT_MSG);
        isValid = false;
    } else if (!nameRegex.test(username.trim())) {
        showFormError("username", "Please enter first and last name");
        isValid = false;
    }

    if (!email.trim()) {
        showFormError("email", "Email is required");
        isValid = false;
    } else if (containsHtmlChars(email)) {
        showFormError("email", HACK_ATTEMPT_MSG);
        isValid = false;
    } else if (!validateEmailFormat(email)) {
        showFormError("email", "Invalid email format");
        isValid = false;
    }


    return isValid;
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

    if (!password) {
        showFormError("signup-password", "Password is required");
        isValid = false;
    } else if (containsHtmlChars(password)) {
        showFormError("signup-password", HACK_ATTEMPT_MSG);
        isValid = false;
    } else {
        const errors = [];
        if (password.length < 6) errors.push("min. 6");
        if (!/[a-z]/.test(password)) errors.push("lowercase chars");
        if (!/[A-Z]/.test(password)) errors.push("uppercase");
        if (!/[0-9]/.test(password)) errors.push("number");
        if (!/[^a-zA-Z0-9]/.test(password)) errors.push("special");

        if (errors.length > 0) {
            showFormError("signup-password", `Insecure Password - <a href="https://www.bsi.bund.de/EN/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html" target="_blank" rel="noopener">BSI</a>`, true);
            isValid = false;
        }
    }

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

    const inputs = signupForm.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"]'
    );
    inputs.forEach(input => input.addEventListener("input", handleInputChange));

    const checkbox = document.getElementById("confirm-check");
    if (checkbox) checkbox.addEventListener("change", updateSubmitButtonState);

    document.querySelectorAll(".password-icon-toggle").forEach(toggle => setupPasswordToggle(toggle));

    signupForm.addEventListener("submit", async event => {
        event.preventDefault();
        await handleFormSubmit(signupUserCallback, handleAuthErrorCallback);
    });
}

function handleInputChange() {
    clearFormErrors();
    updateSubmitButtonState();
}

function setupPasswordToggle(toggle) {
    const targetId = toggle.dataset.target;
    const passwordInput = document.getElementById(targetId);
    if (!passwordInput) return;

    passwordInput.addEventListener("input", () => updatePasswordIcon(passwordInput, toggle));
    toggle.addEventListener("click", () => togglePasswordVisibility(toggle));
}

async function handleFormSubmit(signupUserCallback, handleAuthErrorCallback) {
    const username = document.querySelector('input[name="username"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm-password"]').value;
    const acceptedPolicy = document.getElementById("confirm-check").checked;

    const valid = validateSignupForm(username, email, password, confirmPassword, acceptedPolicy);
    if (!valid) return;

    try {
        await signupUserCallback(email, password, username);
        // Show success message only after successful signup
        showSuccessMessage();
    } catch (error) {
        handleAuthErrorCallback(error, "signup");
    }
}
