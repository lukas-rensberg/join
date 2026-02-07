import {auth, loadTasks} from "./database.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const DASHBOARD_CACHE_KEY = 'dashboardData';

/** MediaQueryList for desktop breakpoint (min-width: 812px) */
const desktopMediaQuery = window.matchMedia("(min-width: 812px)");

/**
* Checks if the current viewport is desktop size
* @returns {boolean} True if viewport width >= 812px
*/
function isDesktop() {
    return desktopMediaQuery.matches;
}

/**
 * Handles the mobile dashboard animation sequence
 * 
 * Adds animation classes to greeting and dashboard containers on mobile devices.
 * After 3 seconds, removes the animation classes and updates the dashboard position.
 * Only triggers if the greeting container has the "loaded" class and viewport is mobile size.
 */
function mobileDashboardAnimation (){
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
    } catch (error) {
        // Silently fail if localStorage is not available
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
    } catch (error) {
        return null;
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
 *
 * Manages the DOM placement of the greeting container element based on the current viewport width.
 * When the viewport is 812px or larger, inserts the greeting container as the first child of the dashboard.
 * Otherwise, maintains the greeting container's current position in the DOM.
 * This function is called on page load and during window resize events to ensure proper positioning.
 */
function moveGreetingContainer() {
    const greetingContainer = document.querySelector(".greeting-container");
    const dashboardContainer = document.querySelector(".dashboard-container");
    // if (!greetingContainer || !dashboardContainer) return;

    if (isDesktop()) {
        dashboardContainer.insertBefore(greetingContainer, dashboardContainer.firstChild);
    }


}

/**
 * Update greeting and username on the overview page
 */
function updateGreeting() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const greetingContainer = document.querySelector(".greeting-container");
            const greetingElement = document.querySelector(".greeting-container p");
            const createSpan = document.createElement("span");
            const headlineElement = document.createElement("h1");
            const headlineSpan = document.createElement("span");


            if (greetingElement) {
                // For anonymous users, remove comma and make greeting stand alone
                if (user.isAnonymous) {
                    greetingElement.textContent = getTimeBasedGreeting();
                    greetingElement.classList.add("greeting-guest");
                    if (isDesktop()) {
                        greetingElement.classList.add("greeting-guest-large");
                    } else {
                        greetingElement.classList.remove("greeting-guest-large");
                    }

                } else {
                    greetingElement.textContent = getTimeBasedGreeting() + ",";
                    greetingElement.classList.remove("greeting-guest");
                    greetingElement.classList.remove("greeting-guest-large");
                    greetingContainer.append(createSpan);
                    createSpan.classList.add("h1-wrapper");
                    createSpan.append(headlineElement);
                    headlineElement.classList.add("h1-colorized");
                    headlineElement.append(headlineSpan);
                    headlineSpan.classList.add("marquee-text");
                }
            }
            const nameElement = document.querySelector(".greeting-container .h1-colorized .marquee-text");

            if (nameElement) {
                if (user.displayName) {
                    nameElement.textContent = user.displayName;
                    nameElement.title = user.displayName;

                    const h1 = nameElement.closest(".h1-colorized");
                    const wrapper = document.querySelector(".h1-wrapper");

                    requestAnimationFrame(() => {
                        const textWidth = nameElement.scrollWidth;
                        const containerWidth = wrapper ? wrapper.clientWidth : 0;

                        if (isDesktop() && textWidth > containerWidth) {
                            h1.classList.add("marquee");
                            nameElement.style.animation = "marqueeOnce 5s linear forwards";

                            nameElement.addEventListener(
                                "animationend",
                                () => {
                                    nameElement.style.animation = "none";
                                    nameElement.style.transform = "translateX(0)";

                                    h1.classList.remove("marquee");
                                    h1.classList.add("fixed");

                                    nameElement.style.display = "unset";
                                },
                                {once: true}
                            );
                        } else {
                            h1.classList.add("fixed");
                            nameElement.style.display = "unset";
                        }
                    });
                } else if (user.isAnonymous) {
                    nameElement.style.display = "none";
                } else if (user.email) {
                    const emailName = user.email.split("@")[0];
                    const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                    nameElement.textContent = formattedName;
                    nameElement.title = formattedName;
                    nameElement.style.display = "block";
                }
            }

            // Show greeting container after data is loaded
            if (greetingContainer) {
                greetingContainer.classList.add("loaded");
            }

            // Update avatar initials in header
            updateAvatarInitials(user);
            mobileDashboardAnimation ()
        }
    });
}

/**
 * Update avatar initials based on username
 */
function updateAvatarInitials(user) {
    const avatarElement = document.querySelector(".avatar");

    if (avatarElement) {
        let initials = "U"; // Default

        if (user.displayName) {
            const nameParts = user.displayName.trim().split(" ");
            if (nameParts.length >= 2) {
                initials = nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
            } else {
                initials = nameParts[0][0].toUpperCase() + (nameParts[0][1] || "").toUpperCase();
            }
        } else if (user.email) {
            initials = user.email[0].toUpperCase() + (user.email[1] || "").toUpperCase();
        } else if (user.isAnonymous) {
            initials = "GU"; // Guest User
        }

        avatarElement.textContent = initials;
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
 * @returns {Object} Object with counts for each category and total
 */
function countTasksByCategory(tasks) {
    const counts = {
        'to-do': 0,
        'in-progress': 0,
        'await-feedback': 0,
        'done': 0,
        total: 0
    };

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
    let urgentCount = 0;
    let nearestDeadline = null;

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

    // Cache the data for faster initial load next time
    cacheDashboardData({
        counts,
        urgentCount: urgentInfo.urgentCount,
        nearestDeadline: urgentInfo.nearestDeadline ? urgentInfo.nearestDeadline.toISOString() : null
    });

    // Update category counts
    updateNumberElement('.card-todo .number', counts['to-do']);
    updateNumberElement('.card-progress .number', counts['in-progress']);
    updateNumberElement('.card-feedback .number', counts['await-feedback']);
    updateNumberElement('.card-done .number', counts['done']);
    updateNumberElement('.card-board .number', counts.total);

    // Update urgent count
    updateNumberElement('.card-urgent-deadline .number', urgentInfo.urgentCount);

    // Update deadline
    const deadlineElement = document.querySelector('.deadline-section .date');
    if (deadlineElement) {
        const formattedDate = formatDeadlineDate(urgentInfo.nearestDeadline);
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
    if (element) {
        element.textContent = value;
    }
}

/**
 * Applies cached dashboard data to the UI
 * @param {Object} cachedData - Cached dashboard data
 */
function applyCachedData(cachedData) {
    if (!cachedData) return;

    const {counts, urgentCount, nearestDeadline} = cachedData;

    // Update category counts from cache
    updateNumberElement('.card-todo .number', counts['to-do']);
    updateNumberElement('.card-progress .number', counts['in-progress']);
    updateNumberElement('.card-feedback .number', counts['await-feedback']);
    updateNumberElement('.card-done .number', counts['done']);
    updateNumberElement('.card-board .number', counts.total);

    // Update urgent count from cache
    updateNumberElement('.card-urgent-deadline .number', urgentCount);

    // Update deadline from cache
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
    // Apply cached data immediately for faster perceived load
    const cachedData = getCachedDashboardData();
    if (cachedData) {
        applyCachedData(cachedData);
    }

    // Load fresh data from Firebase (will update and re-cache)
    loadTasks(updateDashboardNumbers);
}

// Initialize greeting when page loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        moveGreetingContainer();
        updateGreeting();
        addCardListeners();
        initDashboard();
    });
} else {
    moveGreetingContainer();
    updateGreeting();
    addCardListeners();
    initDashboard();
}
// Update greeting container position on window resize
window.addEventListener('resize', moveGreetingContainer);
