import {
    signInWithEmailAndPassword,
    signInAnonymously,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {auth, ensureUserAsContact, createContact} from "./database.js";
import {initLoginPage, initLogout} from "./login.js";
import {initSignupPage} from "./signup.js";
import {handleAuthError, showInlineError} from "./errorHandler.js";
import {getRandomColor} from "../utils/contact.js";

const PROTECTED_PAGES = ["overview.html", "contacts.html", "help.html", "addTask.html", "board.html"];
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
 * Generate a random German phone number.
 * @returns {string} A phone number string in the format "+49 XXXX XXXXXXX"
 */
export function generatePhoneNumber() {
    const prefix = Math.floor(Math.random() * 10000);
    const number = Math.floor(Math.random() * 10000000);
    return `+49 ${String(prefix).padStart(4, '0')} ${String(number).padStart(7, '0')}`;
}

/**
 * Check if current page is a protected page (requires authentication)
 * @returns {boolean} True if current page is protected, false otherwise
 */
function isProtectedPage() {
    const currentPage = window.location.pathname.split("/").pop();
    return PROTECTED_PAGES.some(page => currentPage.includes(page));
}

/**
 * Check if current page is the login or signup page (requires authentication)
 * @return {boolean} True if current page is login or signup, false otherwise
 */
function isLoginPage() {
    const currentPage = window.location.pathname.split("/").pop();
    return currentPage === LOGIN_PAGE || currentPage === "signup.html" || currentPage === "";
}

/**
 * Listen for authentication state changes and handle redirects and contact creation accordingly
 * - If user is authenticated, ensure they exist as a contact and redirect to overview if on login page
 * - If user is not authenticated and on a protected page, redirect to login page
 * @param {Object} user - The authenticated user object from Firebase Auth, or null if not authenticated
 * @returns {Promise<void>} A promise that resolves when the auth state change handling is complete
 */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await ensureUserAsContact(user, generatePhoneNumber, getRandomColor, getInitials);

        if (isLoginPage()) window.location.href = `./${OVERVIEW_PAGE}`;
    } else if (isProtectedPage()) {
        window.location.href = `./${LOGIN_PAGE}`;
    }
});

/**
 * Helper function to handle user login with email and password (login page)
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<void>} A promise that resolves when the login process is complete
 */
export async function loginUser(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Helper function to handle anonymous user login without email and password (login page)
 * @returns {Promise<void>} A promise that resolves when the login process is complete
 */
export async function guestLogin() {
    await signInAnonymously(auth);
}

/**
 * Create a new user account in Firebase Auth (signup page)
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @param {string} username - The user's display name to be set in the profile and contact
 * @returns {Promise<void>} A promise that resolves when the signup process is complete
 */
export async function signupUser(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {displayName: username});
    await createContact(userCredential.user.uid, username, email, generatePhoneNumber(), getRandomColor(), getInitials(username), true);
    await signOut(auth);
}

/**
 * Helper function to handle logout of the current user (all pages)
 * @returns {Promise<void>} A promise that resolves when the logout process is complete
 */
export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = `./${LOGIN_PAGE}`;
    } catch (error) {
        showInlineError("An error occurred during logout. Please try again.");
    }
}

/**
 * Initialize authentication-related functionality based on the current page
 * - On login page: initialize login form and guest login
 * - On signup page: initialize signup form
 * - On protected pages: initialize logout functionality
 * @returns {void}
 */
export function initAuth() {
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === LOGIN_PAGE || currentPage === "") {
        initLoginPage(loginUser, guestLogin, handleAuthError);
    } else if (currentPage === "signup.html") {
        initSignupPage(signupUser, handleAuthError);
    } else if (isProtectedPage()) {
        initLogout(handleLogout);
    }
}

document.addEventListener("DOMContentLoaded", initAuth);