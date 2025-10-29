/**
 * Signup Module - Handles signup page functionality
 */

/**
 * Clear error messages and red borders from form inputs
 */
function clearFormErrors() {
  const existingError = document.querySelector(".auth-error-message");
  if (existingError) {
    existingError.remove();
  }
  const form = document.querySelector("form");
  if (form) {
    const formInputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    formInputs.forEach(inp => {
      inp.style.borderBottom = "";
    });
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
 * Validate signup form inputs (signup page)
 */
function validateSignupForm(password, confirmPassword, acceptedPolicy) {
  const errorMessage = document.querySelector(".pw-not-matching");

  if (password !== confirmPassword) {
    if (errorMessage) errorMessage.style.display = "block";
    return false;
  } else {
    if (errorMessage) errorMessage.style.display = "none";
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }

  if (!acceptedPolicy) {
    alert("Please accept the Privacy Policy to continue.");
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
    // Clear error messages and red borders when user types
    const inputs = signupForm.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
      input.addEventListener("input", clearFormErrors);
    });

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

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.querySelector('input[name="username"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const password = document.querySelector('input[name="password"]').value;
      const confirmPassword = document.querySelector('input[name="confirm-password"]').value;
      const acceptedPolicy = document.getElementById("confirm-check").checked;

      if (!validateSignupForm(password, confirmPassword, acceptedPolicy)) {
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

