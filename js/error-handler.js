/**
 * Error Handler Module - Handles authentication errors
 */

import { createAuthErrorMessage } from "./template.js";

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

