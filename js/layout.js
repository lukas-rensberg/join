import {auth} from "./database.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    generateFooterWithActiveStates,
    generateLoggedInAsideHTML,
    generateLoggedInHeaderHTML, generateLoggedOutAsideHTML,
    generateLoggedOutHeaderHTML, generateNavlinkWithActiveState
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

    if (user.email) return user.email[0].toUpperCase() + (user.email[1] || "").toUpperCase();

    if (user.isAnonymous) return "GU";

    return "U";
}

/**
 * Generate header HTML
 * @param {object|null} user - Firebase user object or null
 * @returns {string} Header HTML string
 */
function generateHeaderHTML(user) {
    const userInitials = getUserInitials(user);
    return user ? generateLoggedInHeaderHTML(userInitials) : generateLoggedOutHeaderHTML();
}

/**
 * Generate aside navigation HTML
 * @param {string} activePage - The current active page
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @returns {string} Aside HTML string
 */
function generateAsideNavbar(activePage, isLoggedIn) {
    const items = getNavItems();
    const topLinks = buildNavLinks(items, "top", activePage);
    const bottomLinks = buildNavLinks(items, "bottom", activePage);
    if (!isLoggedIn) return generateLoggedOutAsideHTML(bottomLinks);
    return generateLoggedInAsideHTML(topLinks, bottomLinks);
}

function buildNavLinks(items, pos, activePage) {
    return items.filter(item => item.pos === pos).map(el => {
        const active = activePage === el.href ? 'class="active-nav-link"' : "";
        if (pos === "bottom") return `<a href="${el.href}" ${active}>${el.label}</a>`;
        return `<a href="${el.href}" ${active}>
            <img src="./assets/menu_icons/${el.icon}" alt="${el.label} Icon"/>${el.label}
        </a>`;
    }).join("");
}

function getNavItems() {
    return [
        {href: "legalNotice.html", label: "Legal Notice", pos: "bottom"},
        {href: "privacy.html", label: "Privacy Policy", pos: "bottom"},
        {href: "overview.html", icon: "summary.svg", label: "Summary", pos: "top"},
        {href: "addTask.html", icon: "add-task.svg", label: "Add Task", pos: "top"},
        {href: "board.html", icon: "board.svg", label: "Board", pos: "top"},
        {href: "contacts.html", icon: "contacts.svg", label: "Contacts", pos: "top"}
    ];
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
        if (user) attachLogoutHandler();
    }
}

/**
 * Render the aside navigation dynamically
 * @param {boolean} isLoggedIn - Whether the user is logged in
 */
function renderAside(isLoggedIn) {
    const aside = document.querySelector("aside.aside-desktop");
    if (aside) aside.innerHTML = generateAsideNavbar(getCurrentPage(), isLoggedIn);
}

/**
 * Generate footer HTML based on login status
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @param {string} activePage - The current active page
 * @returns {string} Footer HTML string
 */
function generateFooterHTML(isLoggedIn, activePage) {
    if (isLoggedIn) {
        generateLoggedInFooter(activePage);
    } else {
        generateLoggedOutFooter(activePage)
    }
}

function generateLoggedInFooter(activePage) {
    const navItems = [
        {href: "overview.html", class: "nav-summary", label: "Summary"},
        {href: "addTask.html", class: "nav-add-task", label: "Add Task"},
        {href: "board.html", class: "nav-board", label: "Board"},
        {href: "contacts.html", class: "nav-contacts", label: "Contacts"}
    ];

    return navItems.map(item => {
        generateNavlinkWithActiveState(item, activePage === item.href ? ' active' : '')
    }).join("");
}

function generateLoggedOutFooter(activePage) {
    const isPrivacyActive = activePage === "privacy.html" ? " active" : "";
    const isLegalActive = activePage === "legalNotice.html" ? " active" : "";
    return generateFooterWithActiveStates(isPrivacyActive, isLegalActive);
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initLayout());
} else {
    initLayout();
}
