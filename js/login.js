/**
 * Login & Logout Module - Handles login/logout page functionality
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
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(inp => {
      inp.style.borderBottom = "";
    });
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
    // Clear error messages and red borders when user types
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    [emailInput, passwordInput].forEach(input => {
      if (input) {
        input.addEventListener("input", clearFormErrors);
      }
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

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
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        await handleLogoutCallback();
      });
    }
  });
}

