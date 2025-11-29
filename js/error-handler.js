/**
 * Error Handler Module - Handles authentication errors
 */

import { createAuthErrorMessage } from "./template.js";

/**
 * Show inline error message in a container or page
 * @param {string} message Error message to display
 * @param {string} containerId Optional container ID to show error in
 */
export function showInlineError(message, containerId = null) {
  // Remove any existing inline errors
  const existingErrors = document.querySelectorAll(".inline-error-message");
  existingErrors.forEach(error => error.remove());

  const errorDiv = document.createElement("div");
  errorDiv.className = "inline-error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff4646;
    background-color: #ffebee;
    border: 1px solid #ff4646;
    border-radius: 4px;
    padding: 12px 16px;
    font-size: 14px;
    margin: 16px 0;
    display: flex;
    align-items: center;
  `;

  // Add error icon
  const icon = document.createElement("span");
  icon.innerHTML = "⚠️";
  icon.style.marginRight = "8px";
  errorDiv.insertBefore(icon, errorDiv.firstChild);

  // Insert error in specific container or fallback locations
  let targetContainer = null;
  
  if (containerId) {
    targetContainer = document.getElementById(containerId);
  }
  
  if (!targetContainer) {
    // Try common containers
    targetContainer = document.querySelector(".contact-modal") || 
                     document.querySelector(".main-content") ||
                     document.querySelector("main") ||
                     document.body;
  }
  
  if (targetContainer === document.body) {
    // If inserting in body, position it at the top
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "20px";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translateX(-50%)";
    errorDiv.style.zIndex = "10000";
    errorDiv.style.maxWidth = "500px";
  }
  
  targetContainer.insertBefore(errorDiv, targetContainer.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

/**
 * Show error message below form fields
 */
export function showErrorMessage(message, context = "login") {
  const existingError = document.querySelector(".auth-error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = createAuthErrorMessage(message);

  const form = document.querySelector("form");
  if (form) {
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
      input.style.borderBottom = "0.06rem solid #ff0000";
    });

    const firstButton = form.querySelector(".btn-primary");
    if (firstButton) {
      form.insertBefore(errorDiv, firstButton);
    } else {
      form.appendChild(errorDiv);
    }
  }
}

/**
 * Handle authentication errors (login page, signup page, protected pages)
 */
export function handleAuthError(error, context = "auth") {
  console.error(`${context} error:`, error);

  let errorMessage = "An error occurred. Please try again.";

  switch (error.code) {
    case "auth/invalid-email":
      errorMessage = "Invalid email address.";
      break;
    case "auth/user-disabled":
      errorMessage = "This account has been disabled.";
      break;
    case "auth/user-not-found":
      errorMessage = "Check your email and password. Please try again.";
      break;
    case "auth/wrong-password":
      errorMessage = "Check your email and password. Please try again.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Check your email and password. Please try again.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many failed attempts. Please try again later.";
      break;

    case "auth/email-already-in-use":
      errorMessage = "This email is already registered.";
      break;
    case "auth/operation-not-allowed":
      errorMessage = "Email/password accounts are not enabled.";
      break;
    case "auth/weak-password":
      errorMessage = "Password is too weak. Please use a stronger password.";
      break;

    default:
      errorMessage = error.message;
  }

  showErrorMessage(errorMessage, context);
}

