import {
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, database, ensureUserAsContact, createContactForUser } from "./database.js";
import { initLoginPage, initLogout } from "./login.js";
import { initSignupPage, showSuccessMessage } from "./signup.js";
import { handleAuthError } from "./error-handler.js";

const PROTECTED_PAGES = ["overview.html", "contacts.html", "help.html", "legal_notice.html", "kanban.html"];
const LOGIN_PAGE = "index.html";
const OVERVIEW_PAGE = "overview.html";

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
    console.log("User authenticated:", user.email || "Guest User");
    
    // Ensure user exists as contact
    await ensureUserAsContact(user);
    
    if (isLoginPage() && !window.location.pathname.includes("signup.html")) {
      window.location.href = `./${OVERVIEW_PAGE}`;
    }
  } else {
    console.log("User not authenticated");
    
    if (isProtectedPage()) {
      window.location.href = `./${LOGIN_PAGE}`;
    }
  }
});

/**
 * Login user with email and password (login page)
 */
async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  console.log("User logged in:", userCredential.user);
  window.location.href = `./${OVERVIEW_PAGE}`;
}

/**
 * Guest login using anonymous authentication (login page)
 */
async function guestLogin() {
  const userCredential = await signInAnonymously(auth);
  console.log("Guest logged in:", userCredential.user);
  window.location.href = `./${OVERVIEW_PAGE}`;
}

/**
 * Create new user account (signup page)
 */
async function signupUser(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(userCredential.user, {
    displayName: username,
  });

  console.log("User created:", userCredential.user);

  // Create contact in RTDB for the new user
  await createContactForUser(userCredential.user.uid, username, email);

  showSuccessMessage();

  setTimeout(() => {
    window.location.href = `./${LOGIN_PAGE}`;
  }, 2000);
}

/**
 * Handle user logout (protected pages)
 */
async function handleLogout() {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
    window.location.href = `./${LOGIN_PAGE}`;
  } catch (error) {
    console.error("Logout error:", error);
    alert("An error occurred during logout. Please try again.");
  }
}

/**
 * Initialize appropriate functionality based on current page (all pages)
 */
function initAuth() {
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

window.addEventListener("load", () => {
  if (window.location.pathname.includes(LOGIN_PAGE) || window.location.pathname.endsWith("/")) {
    const wrapper = document.querySelector(".logo-wrapper");
    if (wrapper) {
      setTimeout(() => {
        wrapper.style.position = "absolute";
      }, 700);
    }
  }
});

/**
 * Re-export auth and database for use in other modules
 */
export { auth, database };
