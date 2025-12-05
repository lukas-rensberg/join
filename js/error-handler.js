/**
 * Error Handler Module - Handles authentication and form validation errors
 */

import { createAuthErrorMessage } from "./template.js";

/**
 * Show error message below form fields (for auth forms)
 */
export function showErrorMessage(message) {
  // Remove any existing error messages
  const existingError = document.querySelector(".auth-error-message");
  if (existingError) {
    existingError.remove();
  }

  // Create error message element using template
  const errorDiv = createAuthErrorMessage(message);

  // Add red border to input fields
  const form = document.querySelector("form");
  if (form) {
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
      input.style.borderBottom = "0.06rem solid #ff0000";
    });

    // Insert before the first button (login button)
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

  let errorMessage;

  switch (error.code) {
    // Login errors
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

    // Signup errors
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

  showErrorMessage(errorMessage);
}

/**
 * Show field-specific error message below a form field
 * @param {string} fieldName - Name of the field (e.g., 'title', 'dueDate', 'category')
 * @param {string} message - Error message to display
 * @return {void}
 */
export function showFieldError(fieldName, message) {
  let formGroup;
  let inputElement;

  if (fieldName === 'title') {
    formGroup = document.querySelector('.form-group-title');
    inputElement = formGroup?.querySelector('.task-title');
  } else if (fieldName === 'dueDate') {
    const dueDateInput = document.getElementById('dueDate');
    formGroup = dueDateInput?.closest('.form-group');
    inputElement = dueDateInput;
  } else if (fieldName === 'category') {
    const categoryWrapper = document.getElementById('categoryDropdownWrapper');
    formGroup = categoryWrapper?.closest('.form-group');
    inputElement = categoryWrapper;
  }

  if (!formGroup) return;

  // Remove existing error for this field
  const existingError = formGroup.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error visible';
  errorDiv.textContent = message;

  // Add red border to the input/dropdown
  if (inputElement) {
    if (fieldName === 'category') {
      const dropdownHeader = inputElement.querySelector('.dropdown-header');
      if (dropdownHeader) {
        dropdownHeader.style.borderBottomColor = '#ff3d00';
      }
    } else if (fieldName === 'dueDate') {
      const inputWrapper = inputElement.closest('.input-with-icon');
      if (inputWrapper) {
        inputWrapper.style.borderColor = '#ff3d00';
      }
    } else {
      inputElement.style.borderColor = '#ff3d00';
    }
  }

  // Add error message to form group
  formGroup.appendChild(errorDiv);
  formGroup.classList.add('has-error');
}

/**
 * Clear error for a specific field
 * @param {string} fieldName - Name of the field
 * @return {void}
 */
export function clearFieldError(fieldName) {
  let formGroup;
  let inputElement;

  if (fieldName === 'title') {
    formGroup = document.querySelector('.form-group-title');
    inputElement = formGroup?.querySelector('.task-title');
  } else if (fieldName === 'dueDate') {
    const dueDateInput = document.getElementById('dueDate');
    formGroup = dueDateInput?.closest('.form-group');
    inputElement = dueDateInput;
  } else if (fieldName === 'category') {
    const categoryWrapper = document.getElementById('categoryDropdownWrapper');
    formGroup = categoryWrapper?.closest('.form-group');
    inputElement = categoryWrapper;
  }

  if (formGroup) {
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }

    // Remove red border
    if (inputElement) {
      if (fieldName === 'category') {
        const dropdownHeader = inputElement.querySelector('.dropdown-header');
        if (dropdownHeader) {
          dropdownHeader.style.borderBottomColor = '';
        }
      } else if (fieldName === 'dueDate') {
        const inputWrapper = inputElement.closest('.input-with-icon');
        if (inputWrapper) {
          inputWrapper.style.borderColor = '';
        }
      } else {
        inputElement.style.borderColor = '';
      }
    }

    formGroup.classList.remove('has-error');
  }
}

/**
 * Clear all field errors
 * @return {void}
 */
export function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(error => {
    error.remove();
  });

  document.querySelectorAll('.form-group').forEach(group => {
    group.classList.remove('has-error');
  });

  document.querySelectorAll('.task-title, #dueDate').forEach(input => {
    input.style.borderColor = '';
  });

  document.querySelectorAll('.input-with-icon').forEach(wrapper => {
    wrapper.style.borderColor = '';
  });

  document.querySelectorAll('.dropdown-header').forEach(header => {
    header.style.borderBottomColor = '';
  });
}

/**
 * Show success banner at the top of the page
 * @param {string} message - Success message to display
 * @param {number} duration - Duration in milliseconds (default: 2000)
 * @return {void}
 */
export function showSuccessBanner(message = 'Success!', duration = 2000) {
  clearAllFieldErrors();

  let successBanner = document.querySelector('.success-banner');

  if (!successBanner) {
    successBanner = document.createElement('div');
    successBanner.className = 'success-banner';
    document.body.appendChild(successBanner);
  }

  successBanner.textContent = message;
  successBanner.classList.add('visible');

  setTimeout(() => {
    successBanner.classList.remove('visible');
  }, duration);
}

/**
 * Show error banner at the top of the page
 * @param {string} message - Error message to display
 * @param {number} duration - Duration in milliseconds (default: 4000)
 * @return {void}
 */
export function showErrorBanner(message = 'An error occurred', duration = 4000) {
  let errorBanner = document.querySelector('.error-banner');

  if (!errorBanner) {
    errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    document.body.appendChild(errorBanner);
  }

  errorBanner.textContent = message;
  errorBanner.classList.add('visible');

  setTimeout(() => {
    errorBanner.classList.remove('visible');
  }, duration);
}
