/**
 * @fileoverview Centralized cache manager for localStorage operations.
 * Provides generic get/set functions and domain-specific wrappers.
 */

const DASHBOARD_CACHE_KEY = 'dashboardData';

/**
 * Stores data in localStorage under the given key.
 * Silently fails if localStorage is unavailable or quota is exceeded.
 * @param {string} key - The localStorage key.
 * @param {*} data - The data to store (will be JSON-serialized).
 * @returns {void}
 */
export function setCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {
    }
}

/**
 * Retrieves and parses data from localStorage for the given key.
 * @param {string} key - The localStorage key.
 * @returns {*|null} The parsed data, or null if not found or on error.
 */
export function getCache(key) {
    try {
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (_) {
        return null;
    }
}

/**
 * Saves dashboard data to localStorage for faster initial load.
 * @param {Object} data - Dashboard data containing counts, urgentCount, and nearestDeadline.
 * @returns {void}
 */
export function cacheDashboardData(data) {
    setCache(DASHBOARD_CACHE_KEY, data);
}

/**
 * Loads cached dashboard data from localStorage.
 * @returns {Object|null} Cached dashboard data or null if not available.
 */
export function getCachedDashboardData() {
    return getCache(DASHBOARD_CACHE_KEY);
}

