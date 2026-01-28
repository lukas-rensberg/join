import { auth } from "./database.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  generateLoggedInHeaderHTML,
  generateLoggedOutHeaderHTML
} from "./template.js";

/**
 * Get the current page name from the URL
 * @returns {string} The current page filename
 */
function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

/**
 * Get user initials from Firebase user object
 * @param {object} user - Firebase user object
 * @returns {string} User initials
 */
function getUserInitials(user) {
  if (!user) return "";

  if (user.displayName) {
    const nameParts = user.displayName.trim().split(" ");
    if (nameParts.length >= 2) {
      return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
    }
    return nameParts[0][0].toUpperCase() + (nameParts[0][1] || "").toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase() + (user.email[1] || "").toUpperCase();
  }

  if (user.isAnonymous) {
    return "GU";
  }

  return "U";
}

/**
 * Generate header HTML
 * @param {object|null} user - Firebase user object or null
 * @returns {string} Header HTML string
 */
function generateHeaderHTML(user) {
  const userInitials = getUserInitials(user);
  const authElements = user ?
      generateLoggedInHeaderHTML(userInitials) :
      generateLoggedOutHeaderHTML();

  return `
    <img src="./assets/icons/logo-white.svg" alt="Join Logo"/>
    <div class="header-right">
      ${authElements}
    </div>
  `;
}

/**
 * Generate aside navigation HTML
 * @param {string} activePage - The current active page
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @returns {string} Aside HTML string
 */
function generateAsideHTML(activePage, isLoggedIn) {
  if (!isLoggedIn) {
    return `
      <div class="aside-navbar">
        <a href="index.html" class="login-link">
          <img src="./assets/menu_icons/login.svg" alt="Login Icon"/>
          Log in
        </a>
      </div>
      <div class="aside-links">
        <a href="legal_notice.html">Legal Notice</a>
        <a href="privacy.html">Privacy Policy</a>
      </div>
    `;
  }

  // Logged in: Show full navigation
  const navItems = [
    { href: "overview.html", icon: "summary.svg", label: "Summary" },
    { href: "add-task.html", icon: "add-task.svg", label: "Add Task" },
    { href: "board.html", icon: "board.svg", label: "Board" },
    { href: "contacts.html", icon: "contacts.svg", label: "Contacts" }
  ];

  const navLinks = navItems.map(item => {
    const isActive = activePage === item.href ? 'class="active-nav-link"' : "";
    return `
      <a href="${item.href}" ${isActive}>
        <img src="./assets/menu_icons/${item.icon}" alt="${item.label} Icon"/>
        ${item.label}
      </a>
    `;
  }).join("");

  return `
    <div class="aside-navbar">
      ${navLinks}
    </div>
    <div class="aside-links">
      <a href="legal_notice.html">Legal Notice</a>
      <a href="privacy.html">Privacy Policy</a>
    </div>
  `;
}

/**
 * Handle user logout
 */
async function handleLogout(event) {
  event.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "./index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Attach logout event listener
 */
function attachLogoutHandler() {
  const logoutLink = document.getElementById("logoutLink");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", handleLogout);
}

/**
 * Render the header dynamically
 * @param {object|null} user - Firebase user object or null
 */
function renderHeader(user) {
  const header = document.querySelector("header");
  if (header) {
    header.innerHTML = generateHeaderHTML(user);
    if (user) {
      attachLogoutHandler();
    }
  }
}

/**
 * Render the aside navigation dynamically
 * @param {boolean} isLoggedIn - Whether the user is logged in
 */
function renderAside(isLoggedIn) {
  const aside = document.querySelector("aside.aside-desktop");
  if (aside) {
    aside.innerHTML = generateAsideHTML(getCurrentPage(), isLoggedIn);
  }
}

/**
 * Generate footer HTML based on login status
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @param {string} activePage - The current active page
 * @returns {string} Footer HTML string
 */
function generateFooterHTML(isLoggedIn, activePage) {
  if (isLoggedIn) {
    // Logged in: Show full mobile navigation
    const navItems = [
      { href: "overview.html", class: "nav-summary", label: "Summary" },
      { href: "add-task.html", class: "nav-add-task", label: "Add Task" },
      { href: "board.html", class: "nav-board", label: "Board" },
      { href: "contacts.html", class: "nav-contacts", label: "Contacts" }
    ];

    return navItems.map(item => {
      const isActive = activePage === item.href ? ' active' : '';
      return `
        <a class="nav-item${isActive}" href="${item.href}">
          <span class="${item.class}">${item.label}</span>
        </a>
      `;
    }).join("");
  } else {
    // Not logged in: Show login link and legal links
    const isPrivacyActive = activePage === "privacy.html" ? " active" : "";
    const isLegalActive = activePage === "legal_notice.html" ? " active" : "";

    return `
      <a class="nav-item" href="index.html">
        <img src="./assets/menu_icons/login.svg" alt="Login" class="footer-login-icon"/>
        <span class="nav-login">Log In</span>
      </a>
      <a class="legal-link${isPrivacyActive}" href="privacy.html">Privacy Policy</a>
      <a class="legal-link${isLegalActive}" href="legal_notice.html">Legal Notice</a>
    `;
  }
}

/**
 * Render the footer dynamically
 * @param {boolean} isLoggedIn - Whether the user is logged in
 */
function renderFooter(isLoggedIn) {
  const footer = document.querySelector("footer");
  if (footer && !footer.classList.contains("legal-links")) {
    footer.innerHTML = generateFooterHTML(isLoggedIn, getCurrentPage());
  }
}

/**
 * Initialize layout components
 */
export function initLayout() {
  onAuthStateChanged(auth, (user) => {
    renderHeader(user);
    renderAside(!!user);
    renderFooter(!!user);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initLayout());
} else {
  initLayout();
}
