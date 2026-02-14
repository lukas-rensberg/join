import {
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, ensureUserAsContact, createContact } from "./database.js";
import { initLoginPage, initLogout } from "./login.js";
import { initSignupPage, showSuccessMessage } from "./signup.js";
import { handleAuthError, showInlineError } from "./errorHandler.js";
import { getRandomColor } from "../utils/contact.js";

const PROTECTED_PAGES = ["overview.html", "contacts.html", "help.html", "kanban.html", "board.html"];
const LOGIN_PAGE = "index.html";
const OVERVIEW_PAGE = "overview.html";

/**
 * Generate initials from a name string.
 * @param {string} name - The name to generate initials from.
 * @returns {string} The initials (up to 2 characters), or "U" if not available.
 */
export function getInitials(name) {
  const nameParts = name.trim().split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
  return initials || "U";
}

/**
 * Generate random phone number
 * @returns {string} A phone number string in the format "+49 XXX XXX XXX"
 */
export function generatePhoneNumber() {
  const random = Math.floor(Math.random() * 1000000000);
  return `+49 ${String(random).padStart(9, '0').match(/.{1,3}/g).join(' ')}`;
}

/**
 * Check if current page is a protected page (requires authentication)
 */
function isProtectedPage() {
  const currentPage = window.location.pathname.split("/").pop();
  return PROTECTED_PAGES.some(page => currentPage.includes(page));
}

/**
 * Check if current page is the login page (requires authentication)
 */
function isLoginPage() {
  const currentPage = window.location.pathname.split("/").pop();
  return currentPage === LOGIN_PAGE || currentPage === "signup.html" || currentPage === "";
}

/**
 * Auth state observer - handles redirects based on authentication status (protected pages)
 */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserAsContact(user, generatePhoneNumber, getRandomColor, getInitials);

    if (isLoginPage() && !window.location.pathname.includes("signup.html")) {
      window.location.href = `./${OVERVIEW_PAGE}`;
    }
  } else if (isProtectedPage()) window.location.href = `./${LOGIN_PAGE}`;
});

/**
 * Login user with email and password (login page)
 */
export async function loginUser(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Guest login using anonymous authentication (login page)
 */
export async function guestLogin() {
  await signInAnonymously(auth);
}

/**
 * Create new user account (signup page)
 */
export async function signupUser(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {displayName: username});
  await createContact(userCredential.user.uid, username, email, generatePhoneNumber(), getRandomColor(), getInitials(username),true);

  showSuccessMessage();

  setTimeout(() => {
    window.location.href = `./${LOGIN_PAGE}`;
  }, 2000);
}

/**
 * Handle user logout (protected pages)
 */
export async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = `./${LOGIN_PAGE}`;
  } catch (error) { showInlineError("An error occurred during logout. Please try again."); }
}

/**
 * Initialize appropriate functionality based on current page (all pages)
 */
export function initAuth() {
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === LOGIN_PAGE || currentPage === "") {
    initLoginPage(loginUser, guestLogin, handleAuthError);
  } else if (currentPage === "signup.html") initSignupPage(signupUser, handleAuthError);
  else if (isProtectedPage()) initLogout(handleLogout);
}

document.addEventListener("DOMContentLoaded", initAuth);