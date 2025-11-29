/**
 * @fileoverview Form validation for contact management
 * @author Lukas Rensberg
 */

/**
 * Validates email format
 * @param {string} email Email address
 * @return {boolean} True if valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 * @param {string} phone Phone number
 * @return {boolean} True if valid
 */
export function validatePhone(phone) {
  const phoneRegex = /^[\d\s+\-().]+$/;
  return phoneRegex.test(phone) && phone.length >= 5;
}

/**
 * Shows validation error for form field
 * @param {string} fieldId Input element ID
 * @param {string} errorMessage Error message to display
 */
export function showFieldError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  const formGroup = field.closest(".form-group");
  
  let errorSpan = formGroup.querySelector(".error-message");
  if (!errorSpan) {
    errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    formGroup.appendChild(errorSpan);
  }
  
  errorSpan.textContent = errorMessage;
  field.style.borderBottom = "2px solid #ff4646";
}

/**
 * Clears validation errors for form field
 * @param {string} fieldId Input element ID
 */
export function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  const formGroup = field.closest(".form-group");
  
  const errorSpan = formGroup.querySelector(".error-message");
  if (errorSpan) {
    errorSpan.textContent = "";
  }
  
  field.style.borderBottom = "";
}

/**
 * Validates contact form data
 * @param {Object} formData Form data object
 * @return {boolean} True if all fields are valid
 */
export function validateContactForm(formData) {
  let isValid = true;

  if (!formData.name.trim()) {
    showFieldError("contactName", "Name is required");
    isValid = false;
  } else {
    clearFieldError("contactName");
  }

  if (!formData.email.trim()) {
    showFieldError("contactEmail", "Email is required");
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    showFieldError("contactEmail", "Invalid email format");
    isValid = false;
  } else {
    clearFieldError("contactEmail");
  }

  if (!formData.phone.trim()) {
    showFieldError("contactPhone", "Phone is required");
    isValid = false;
  } else if (!validatePhone(formData.phone)) {
    showFieldError("contactPhone", "Invalid phone format");
    isValid = false;
  } else {
    clearFieldError("contactPhone");
  }

  return isValid;
}
