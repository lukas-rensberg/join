import {validateEmailFormat} from "../utils/contact.js";
import {updatePasswordIcon, togglePasswordVisibility} from "./login.js";

/**
 * Clear error messages and red borders from form inputs
 */
function clearFormErrors() {
    const existingError = document.querySelector(".auth-error-message");
    if (existingError) {
        existingError.remove();
    }

    document.querySelectorAll(".error-message").forEach(error => error.remove());

    const form = document.querySelector("form");
    if (form) {
        const formInputs = form.querySelectorAll('input[type="password"], input[type="text"], input[type="email"]');
        formInputs.forEach(inp => {
            inp.style.borderBottom = "";
        });

        const checkbox = document.getElementById("confirm-check");
        if (checkbox) {
            checkbox.style.borderColor = "";
        }
    }
}

/**
 * Show form validation error for a specific field
 * @param {string} fieldId The ID of the input field
 * @param {string} message The error message to display
 */
function showFormError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderBottom = "1px solid #ff4646";

        const existingError = field.parentElement.querySelector(".error-message");
        if (existingError) {
            existingError.remove();
        }

        const errorMsg = document.createElement("span");
        errorMsg.className = "error-message";
        errorMsg.textContent = message;
        field.parentElement.appendChild(errorMsg);
    }
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
 * Validate signup form inputs (signup page)
 */
function validateSignupForm(username, email, password, confirmPassword, acceptedPolicy) {
    clearFormErrors();
    let isValid = true;

    if (!username.trim()) {
        showFormError("username", "Name is required");
        isValid = false;
    }

    if (!email.trim()) {
        showFormError("email", "Email is required");
        isValid = false;
    } else if (!validateEmailFormat(email)) {
        showFormError("email", "Invalid email format");
        isValid = false;
    }

    if (!password) {
        showFormError("signup-password", "Password is required");
        isValid = false;
    } else if (password.length < 6) {
        showFormError("signup-password", "Password must be at least 6 characters");
        isValid = false;
    }

    if (!confirmPassword) {
        showFormError("confirm-password", "Please confirm your password");
        isValid = false;
    } else if (password && password !== confirmPassword) {
        showFormError("confirm-password", "Passwords do not match");
        isValid = false;
    }

    if (!acceptedPolicy) {
        const checkbox = document.getElementById("confirm-check");
        const existingError = checkbox.parentElement.querySelector(".error-message");
        if (existingError) {
            existingError.remove();
        }

        checkbox.style.borderColor = "#ff4646";
        const errorMsg = document.createElement("span");
        errorMsg.className = "error-message";
        errorMsg.textContent = "Please accept the Privacy Policy";
        checkbox.parentElement.appendChild(errorMsg);
        isValid = false;
    }

    return isValid;
}

/**
 * Show success message after signup (signup page)
 */
export function showSuccessMessage() {
    const successContainer = document.querySelector(".signed-up-container");
    if (successContainer) {
        successContainer.style.display = "flex";
        setTimeout(() => {
            successContainer.style.display = "none";
        }, 2000);
    }
}

/**
 * Initialize signup page functionality (signup page)
 * TODO: Extract password toggle setup into separate reusable function
 */
export function initSignupPage(signupUserCallback, handleAuthErrorCallback) {
    const signupForm = document.querySelector("form");
    if (signupForm && document.querySelector('input[name="username"]')) {
        updateSubmitButtonState();

        const inputs = signupForm.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener("input", () => {
                clearFormErrors();
                updateSubmitButtonState();
            });
        });

        const checkbox = document.getElementById("confirm-check");
        if (checkbox) {
            checkbox.addEventListener("change", updateSubmitButtonState);
        }

        const passwordToggles = document.querySelectorAll(".password-icon-toggle");
        passwordToggles.forEach(toggle => {
            const targetId = toggle.getAttribute("data-target");
            const passwordInput = document.getElementById(targetId);

            if (passwordInput) {
                passwordInput.addEventListener("input", () => {
                    updatePasswordIcon(passwordInput, toggle);
                });

                toggle.addEventListener("click", () => {
                    togglePasswordVisibility(toggle);
                });
            }
        });

        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.querySelector('input[name="username"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            const password = document.querySelector('input[name="password"]').value;
            const confirmPassword = document.querySelector('input[name="confirm-password"]').value;
            const acceptedPolicy = document.getElementById("confirm-check").checked;

            if (!validateSignupForm(username, email, password, confirmPassword, acceptedPolicy)) {
                return;
            }

            try {
                await signupUserCallback(email, password, username);
            } catch (error) {
                handleAuthErrorCallback(error, "signup");
            }
        });
    }
}

