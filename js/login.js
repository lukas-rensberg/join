import { validateEmailFormat } from "../utils/contact.js";

/**
 * Clear error messages and red borders from form inputs
 */
function clearFormErrors() {
  const existingError = document.querySelector(".auth-error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(msg => msg.remove());

  const form = document.querySelector("form");
  if (form) {
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(inp => {
      inp.style.borderBottom = "";
    });
  }
}

/**
 * Shows validation error message
 * @param {string} fieldName Form field name
 * @param {string} errorMessage Error message
 */
function showValidationError(fieldName, errorMessage) {
  const input = document.getElementById(fieldName);
  if (input) {
    input.style.borderBottom = "2px solid #ff4646";
    
    const errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.textContent = errorMessage;
    
    input.parentElement.appendChild(errorSpan);
  }
}

/**
 * Validates login form
 * @param {string} email Email address
 * @param {string} password Password
 * @return {boolean} True if valid
 */
function validateLoginForm(email, password) {
  clearFormErrors();
  
  if (!email.trim()) {
    showValidationError("email", "Email is required");
    return false;
  }
  
  if (!validateEmailFormat(email)) {
    showValidationError("email", "Invalid email format");
    return false;
  }
  
  if (!password) {
    showValidationError("password", "Password is required");
    return false;
  }
  
  return true;
}

/**
 * Update password icon based on input value
 */
function updatePasswordIcon(passwordInput, iconElement) {
  const img = iconElement.querySelector("img");

  if (passwordInput.value.length === 0) {
    img.src = "./assets/icons/lock.svg";
    iconElement.classList.remove("clickable");
    passwordInput.type = "password";
  } else {
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
 * Initialize login page functionality (login page)
 */
export function initLoginPage(loginUserCallback, guestLoginCallback, handleAuthErrorCallback) {
  const wrapper = document.querySelector(".logo-wrapper");
  if (wrapper) {
    setTimeout(() => {
      wrapper.style.position = "absolute";
    }, 700);
  }

  const loginForm = document.querySelector("form");
  if (loginForm && document.getElementById("email")) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    [emailInput, passwordInput].forEach(input => {
      if (input) {
        input.addEventListener("input", clearFormErrors);
      }
    });

    const passwordIconToggle = document.querySelector(".password-icon-toggle");
    if (passwordInput && passwordIconToggle) {
      passwordInput.addEventListener("input", () => {
        updatePasswordIcon(passwordInput, passwordIconToggle);
      });

      passwordIconToggle.addEventListener("click", () => {
        togglePasswordVisibility(passwordIconToggle);
      });
    }

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!validateLoginForm(email, password)) {
        return;
      }

      try {
        await loginUserCallback(email, password);
      } catch (error) {
        handleAuthErrorCallback(error, "login");
      }
    });
  }

  const guestButton = document.querySelector(".btn-secondary");
  if (guestButton && guestButton.textContent.includes("Guest")) {
    guestButton.addEventListener("click", async () => {
      try {
        await guestLoginCallback();
      } catch (error) {
        handleAuthErrorCallback(error, "login");
      }
    });
  }
}

/**
 * Initialize logout functionality (protected pages)
 */
export function initLogout(handleLogoutCallback) {
  const logoutLinks = document.querySelectorAll('a[href="./index.html"], a[href="index.html"]');

  logoutLinks.forEach((link) => {
    if (link.textContent.includes("Log Out") || link.textContent.includes("Logout")) {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        await handleLogoutCallback();
      });
    }
  });
}

