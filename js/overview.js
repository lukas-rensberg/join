import {auth, loadTasks} from "./database.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {renderContact} from "./contacts.js";

const DASHBOARD_CACHE_KEY = 'dashboardData';

let counts = {
    'to-do': 0,
    'in-progress': 0,
    'await-feedback': 0,
    'done': 0,
    total: 0
};
let urgentCount = 0;
let nearestDeadline = null;

const desktopMediaQuery = window.matchMedia("(min-width: 812px)");

/**
 * Checks if the current viewport is desktop size
 * @returns {boolean} True if viewport width >= 812px
 */
const isDesktop = () => desktopMediaQuery.matches;

/**
 * Handles the mobile dashboard animation sequence
 *
 * Adds animation classes to greeting and dashboard containers on mobile devices.
 * After 3 seconds, removes the animation classes and updates the dashboard position.
 * Only triggers if the greeting container has the "loaded" class and viewport is mobile size.
 */
function mobileDashboardAnimation() {
    const greetingContainer = document.querySelector(".greeting-container");
    const dashboardContainer = document.querySelector(".dashboard-container");

    if (greetingContainer.classList.contains("loaded") && !isDesktop()) {
        greetingContainer.classList.add("greeting-animation-mobile");
        dashboardContainer.classList.add("dashboard-animation-mobile");
    }
    setTimeout(() => {
        dashboardContainer.classList.add("dashboard-position");
        dashboardContainer.classList.remove("dashboard-animation-mobile");
        greetingContainer.classList.remove("greeting-animation-mobile", "loaded");
    }, 3000);
}

/**
 * Saves dashboard data to localStorage for faster initial load
 * @param {Object} data - Dashboard data to cache
 */
function cacheDashboardData(data) {
    try {
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
    } catch (_) {
    }
}

/**
 * Loads cached dashboard data from localStorage
 * @returns {Object|null} Cached dashboard data or null
 */
function getCachedDashboardData() {
    try {
        const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (_) {
    }
}

/**
 * Get greeting based on current time
 */
function getTimeBasedGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 13) {
        return "Good morning";
    } else if (hour >= 13 && hour < 18) {
        return "Good afternoon";
    } else {
        return "Good evening";
    }
}

/**
 * Handles responsive repositioning of the greeting container
 * On desktop, moves the greeting container inside the dashboard container for better layout.
 * On mobile, it remains in its original position for optimal display.
 * This function is called on page load and on window resize to ensure correct positioning.
 */
function moveGreetingContainer() {
    const greetingContainer = document.querySelector(".greeting-container");
    const dashboardContainer = document.querySelector(".dashboard-container");

    if (isDesktop()) dashboardContainer.insertBefore(greetingContainer, dashboardContainer.firstChild);
}

/**
 * Adds a marquee effect to the username if it exceeds the container width on desktop devices.
 * On mobile devices, it simply displays the username without animation.
 * @param nameElement
 * @param wrapper
 * @param h1
 */
function addMarqueeEffect(nameElement, wrapper, h1) {
    requestAnimationFrame(() => {
        const overflow = isDesktop() && nameElement.scrollWidth > (wrapper?.clientWidth ?? 0);

        if (!overflow) {
            h1.classList.add("fixed");
            return (nameElement.style.display = "unset");
        }
        h1.classList.add("marquee");
        nameElement.style.animation = "marqueeOnce 5s linear forwards";
        nameElement.addEventListener("animationend", () => {
            nameElement.style.animation = nameElement.style.transform = "none";
            superToggle(h1, "marquee", "fixed");
            nameElement.style.display = "unset";
        }, { once: true });
    });
}

/**
 * Initializes greeting update based on auth state.
 * @returns {void}
 */
function updateGreeting() {
    onAuthStateChanged(auth, handleAuthStateChange);
}

/**
 * Handles authentication state changes.
 * @param {Object|null} user
 * @returns {void}
 */
function handleAuthStateChange(user) {
    if (!user) return;

    const dom = getGreetingDOM();
    if (!dom.greetingElement) return;

    setupGreeting(user, dom);
    updateName(user);
    finalizeGreeting(dom.container);

    updateAvatarInitials(user);
    mobileDashboardAnimation();
}

/**
 * Collects required DOM elements.
 * @returns {{container:Element, greetingElement:Element}}
 */
function getGreetingDOM() {
    return {
        container: document.querySelector(".greeting-container"),
        greetingElement: document.querySelector(".greeting-container p")
    };
}

/**
 * Sets up greeting depending on user type.
 * @param {Object} user
 * @param {{container:Element, greetingElement:Element}} dom
 */
function setupGreeting(user, dom) {
    if (user.isAnonymous) return setupGuestGreeting(dom.greetingElement);
    setupUserGreeting(dom.container);
}

/**
 * Updates displayed username.
 * @param {Object} user
 */
function updateName(user) {
    const nameElement = document.querySelector(
        ".greeting-container .h1-colorized .marquee-text"
    );
    if (!nameElement) return;

    if (user.displayName) return applyName(nameElement, user.displayName);
    if (user.isAnonymous) nameElement.style.display = "none";
    if (user.email) applyName(nameElement, formatEmailName(user.email));
}

/**
 * Applies a name to the DOM and adds marquee effect.
 * @param {HTMLElement} element
 * @param {string} name
 */
function applyName(element, name) {
    element.textContent = name;
    element.title = name;
    element.style.display = "block";

    const h1 = element.closest(".h1-colorized");
    const wrapper = document.querySelector(".h1-wrapper");

    addMarqueeEffect(element, wrapper, h1);
}

/**
 * Formats email into a readable name.
 * @param {string} email
 * @returns {string}
 */
function formatEmailName(email) {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Marks greeting as loaded.
 * @param {HTMLElement|null} container
 */
function finalizeGreeting(container) {
    container?.classList.add("loaded");
}

function setupUserGreeting(greetingContainer) {
    const greetingElement = greetingContainer.querySelector("p");
    if (greetingElement) {
        greetingElement.textContent = getTimeBasedGreeting() + ",";
    }

    const wrapper = greetingContainer.appendChild(document.createElement("span"));
    wrapper.className = "h1-wrapper";

    const headline = wrapper.appendChild(document.createElement("h1"));
    headline.className = "h1-colorized";

    headline.appendChild(document.createElement("span")).className = "marquee-text";
}

function setupGuestGreeting(greetingElement) {
    greetingElement.textContent = getTimeBasedGreeting();
    greetingElement.classList.add("greeting-guest");
    if (isDesktop()) greetingElement.classList.add("greeting-guest-large");
    else greetingElement.classList.remove("greeting-guest-large");
}

/**
 * Update avatar initials based on username
 */
function updateAvatarInitials(user) {
    const avatarElement = document.querySelector(".avatar");

    if (avatarElement) {
        avatarElement.textContent = renderContact(user);
    }
}

/**
 * Add click event listeners to all dashboard cards
 */
function addCardListeners() {
    const cards = document.querySelectorAll('.card, .card-urgent-deadline');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = 'board.html';
        });
    });
}

/**
 * Counts tasks by their category
 * @param {Array} tasks - Array of task objects
 * @return {Object} Object with counts for each category and total
 */
function countTasksByCategory(tasks) {
    tasks.forEach(task => {
        const category = task.category || 'to-do';
        if (counts.hasOwnProperty(category)) {
            counts[category]++;
        }
        counts.total++;
    });
    return counts;
}

/**
 * Gets urgent tasks count and the nearest deadline
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Object with urgentCount and nearestDeadline
 */
function getUrgentInfo(tasks) {
    tasks.forEach(task => {
        if (task.priority === 'urgent') {
            urgentCount++;
        }
        if (task.dueDate) {
            const taskDate = new Date(task.dueDate);
            if (!nearestDeadline || taskDate < nearestDeadline) {
                nearestDeadline = taskDate;
            }
        }
    });
    return {urgentCount, nearestDeadline};
}

/**
 * Formats a date to "Month Day, Year" format (e.g., "January 15, 2026")
 * @param {Date} date - Date object to format
 * @returns {string|null} Formatted date string or null
 */
function formatDeadlineDate(date) {
    if (!date) return null;

    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return date.toLocaleDateString('en-US', options);
}

/**
 * Updates the dashboard numbers and deadline display
 * @param {Array} tasks - Array of task objects from Firebase
 */
function updateDashboardNumbers(tasks) {
    const counts = countTasksByCategory(tasks);
    const urgentInfo = getUrgentInfo(tasks);

    cacheDashboardData({
        counts,
        urgentCount: urgentInfo.urgentCount,
        nearestDeadline: urgentInfo.nearestDeadline ? urgentInfo.nearestDeadline.toISOString() : null
    });
    updateCounts(urgentCount)
    updateDeadline(urgentInfo.nearestDeadline)
}

function updateCounts(urgentCount) {
    updateNumberElement('.card-todo .number', counts['to-do']);
    updateNumberElement('.card-progress .number', counts['in-progress']);
    updateNumberElement('.card-feedback .number', counts['await-feedback']);
    updateNumberElement('.card-done .number', counts['done']);
    updateNumberElement('.card-board .number', counts.total);
    updateNumberElement('.card-urgent-deadline .number', urgentCount);
}

function updateDeadline(nearestDeadline) {
    const deadlineElement = document.querySelector('.deadline-section .date');
    if (deadlineElement) {
        const formattedDate = formatDeadlineDate(nearestDeadline);
        deadlineElement.textContent = formattedDate || 'No upcoming deadline';
    }
}

/**
 * Helper function to update a number element's text content
 * @param {string} selector - CSS selector for the element
 * @param {number} value - Number value to display
 */
function updateNumberElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value.toString();
}

/**
 * Applies cached dashboard data to the UI
 * @param {Object} cachedData - Cached dashboard data
 */
function applyCachedData(cachedData) {
    if (!cachedData) return;
    const {urgentCount, nearestDeadline} = cachedData;
    updateCounts(urgentCount)

    const deadlineElement = document.querySelector('.deadline-section .date');
    if (deadlineElement) {
        const date = nearestDeadline ? new Date(nearestDeadline) : null;
        const formattedDate = formatDeadlineDate(date);
        deadlineElement.textContent = formattedDate || 'No upcoming deadline';
    }
}

/**
 * Initializes the dashboard by loading tasks and updating the UI
 * First applies cached data for instant display, then loads fresh data
 */
function initDashboard() {
    const cachedData = getCachedDashboardData();
    if (cachedData) applyCachedData(cachedData);

    loadTasks(updateDashboardNumbers);
}

window.addEventListener('resize', moveGreetingContainer);

const onReady = () => {
    moveGreetingContainer();
    updateGreeting();
    addCardListeners();
    initDashboard();
};

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", onReady) : onReady();