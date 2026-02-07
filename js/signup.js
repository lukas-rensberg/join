import { validateEmailFormat } from "../utils/contact.js";

/**
 * Clear error messages and red borders from form inputs
 */
function clearFormErrors() {
  const existingError = document.querySelector(".auth-error-message");
  if (existingError) {
    existingError.remove();
  }
  
  // Clear field-specific error messages
  const fieldErrors = document.querySelectorAll(".error-message");
  fieldErrors.forEach(error => error.remove());
  
  const form = document.querySelector("form");
  if (form) {
    const formInputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    formInputs.forEach(inp => {
      inp.style.borderBottom = "";
    });
    
    // Clear checkbox border color
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
    
    // Check for existing error message and remove it
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
 * Update password icon based on input value
 */
function updatePasswordIcon(passwordInput, iconElement) {
  const img = iconElement.querySelector("img");
  
  if (passwordInput.value.length === 0) {
    // No text: show lock icon
    img.src = "./assets/icons/lock.svg";
    iconElement.classList.remove("clickable");
    passwordInput.type = "password";
  } else {
    // Has text: show visibility toggle
    iconElement.classList.add("clickable");
    if (passwordInput.type === "password") {
      img.src = "./assets/icons/visibility_off.svg";
    } else {
      img.src = "./assets/icons/visibility.svg";
    }
  }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(toggleElement) {
  const targetId = toggleElement.getAttribute("data-target");
  const passwordInput = document.getElementById(targetId);
  const img = toggleElement.querySelector("img");
  
  // Only toggle if there's text
  if (passwordInput.value.length > 0) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      img.src = "./assets/icons/visibility.svg";
    } else {
      passwordInput.type = "password";
      img.src = "./assets/icons/visibility_off.svg";
    }
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
  
  if (!username.trim()) {
    showFormError("username", "Name is required");
    return false;
  }
  
  if (!email.trim()) {
    showFormError("email", "Email is required");
    return false;
  }
  
  if (!validateEmailFormat(email)) {
    showFormError("email", "Invalid email format");
    return false;
  }

  if (!password) {
    showFormError("signup-password", "Password is required");
    return false;
  }

  if (password.length < 6) {
    showFormError("signup-password", "Password must be at least 6 characters");
    return false;
  }

  if (password !== confirmPassword) {
    showFormError("confirm-password", "Passwords do not match");
    return false;
  }

  if (!acceptedPolicy) {
    const checkbox = document.getElementById("confirm-check");
    
    // Check for existing error message and remove it
    const existingError = checkbox.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
    
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

    // Setup password visibility toggle for all password fields
    const passwordToggles = document.querySelectorAll(".password-icon-toggle");
    passwordToggles.forEach(toggle => {
      const targetId = toggle.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      
      if (passwordInput) {
        // Update icon when user types
        passwordInput.addEventListener("input", () => {
          updatePasswordIcon(passwordInput, toggle);
        });
        
        // Toggle visibility on click
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

