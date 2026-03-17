/**
 * @fileoverview Core dropdown manager handling generic dropdown UI logic (toggle, close, clear),
 * event delegation for both contact and category dropdowns, and initialization.
 * Re-exports all public symbols from contactDropdownManager and categoryDropdownManager
 * so that existing import paths remain unchanged.
 */

import {
    loadContacts,
    populateContactsDropdown,
    selectContact as _selectContact,
    filterOptions as _filterOptions,
    setActiveContainerRef
} from "./contactDropdownManager.js";

import {
    populateCategoriesDropdown,
    selectCategory as _selectCategory,
    setSelectedCategory as _setSelectedCategory
} from "./categoryDropdownManager.js";

import {setSelectedContacts as _setSelectedContacts} from "./contactDropdownManager.js";

/** @type {HTMLElement|null} The currently active form container */
let activeContainer = null;

/**
 * WeakMap storing AbortControllers keyed by container elements.
 * Used to clean up event listeners when a container is re-initialized.
 * @type {WeakMap<HTMLElement, AbortController>}
 */
const dropdownAbortControllers = new WeakMap();

/**
 * Toggles a dropdown's visibility. Opens if closed (or forced), closes if open.
 * @param {string} type - Type of dropdown ('contact' or 'category')
 * @param {boolean} [forceOpen=false] - Force the dropdown to open
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function toggleDropdown(type, forceOpen = false, container) {
    const {wrapper, dropdownContent, dropdownHeader} = getDropdownElements(type, container);
    if (!wrapper || !dropdownContent || !dropdownHeader) return;

    if (forceOpen || !dropdownContent.classList.contains('active')) {
        closeAllDropdowns(type, container);
        dropdownHeader.classList.add('active');
        dropdownContent.classList.add('active');
        if (type === 'contact') container.querySelector('.contact-search-input').focus();
    } else {
        clearDropdown(type, container);
    }
}

/**
 * Retrieves the wrapper, content, and header elements for a dropdown type.
 * @param {string} type - Type of dropdown ('contact' or 'category')
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {{wrapper: HTMLElement|null, dropdownContent: HTMLElement|null, dropdownHeader: HTMLElement|null}}
 */
function getDropdownElements(type, container) {
    const wrapper = container.querySelector(`.${type}-dropdown-wrapper`);
    const dropdownContent = container.querySelector(`.${type}-dropdown-content`);
    const dropdownHeader = wrapper ? wrapper.querySelector('.dropdown-header') : null;

    return {wrapper, dropdownContent, dropdownHeader};
}

/**
 * Closes all dropdowns except the specified type.
 * Resets the contact search filter when closing the contact dropdown.
 * @param {string|null} [except=null] - Dropdown type to exclude from closing
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function closeAllDropdowns(except = null, container) {
    const types = ['contact', 'category'];

    types.forEach(type => {
        if (type === except) return;

        clearDropdown(type, container);
        if (type === 'contact') _filterOptions(container, toggleDropdown);
    });
}

/**
 * Clears (closes) a single dropdown section and resets the contact search input.
 * @param {string} type - Type of dropdown to clear ('contact' or 'category')
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function clearDropdown(type, container) {
    const {dropdownContent, dropdownHeader} = getDropdownElements(type, container);
    if (!dropdownContent || !dropdownHeader) return;
    container.querySelector('.contact-search-input').innerText = '';

    dropdownContent.classList.remove('active');
    dropdownHeader.classList.remove('active');
}

/**
 * Closes any open dropdowns when a click occurs outside of them.
 * @param {MouseEvent} event - The mouse event
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function closeDropdownOnClickOutside(event, container) {
    const isClickInsideContact = event.target.closest('.contact-dropdown-wrapper');
    const isClickInsideCategory = event.target.closest('.category-dropdown-wrapper');

    if (!isClickInsideContact) clearDropdown('contact', container);
    if (!isClickInsideCategory) clearDropdown('category', container);
}

/**
 * Sets up click and input event delegation for all dropdown interactions.
 * @param {HTMLElement} container - The container element to scope events
 * @param {AbortSignal|null} [signal=null] - AbortSignal for cleanup
 * @returns {void}
 */
function setupDropdownEventDelegation(container, signal = null) {
    const options = signal ? {signal} : {};

    container.addEventListener('click', (event) => {
        const {contactHeader, searchInput, categoryHeader, contactOption, categoryOption} = closestEvents(event);

        setupToggleDropdownEventDelegation(event, contactHeader, searchInput, container);

        if (categoryHeader) return toggleDropdown('category', false, container);
        setupContactOptionDelegation(contactOption, container, event);
        setupCategoryOptionDelegation(categoryOption, container);
    }, options);
    setupContactEventDelegation(container, options);
}

/**
 * Gets the closest matching elements for dropdown event handling.
 * @param {MouseEvent} event - The mouse event to analyze
 * @returns {{contactHeader: HTMLElement|null, searchInput: HTMLElement|null, categoryHeader: HTMLElement|null, contactOption: HTMLElement|null, categoryOption: HTMLElement|null}}
 */
function closestEvents(event) {
    const contactHeader = event.target.closest('.contact-dropdown-header');
    const searchInput = event.target.closest('.contact-search-input');
    const categoryHeader = event.target.closest('.category-dropdown-header');
    const contactOption = event.target.closest('.contact-option');
    const categoryOption = event.target.closest('.category-option');
    return {contactHeader, searchInput, categoryHeader, contactOption, categoryOption};
}

/**
 * Handles contact option click delegation.
 * @param {HTMLElement|null} contactOption - The clicked contact option element
 * @param {HTMLElement} container - The container element to scope queries
 * @param {MouseEvent} event - The mouse event
 * @returns {void}
 */
function setupContactOptionDelegation(contactOption, container, event) {
    if (!contactOption) return;
    if (isClickOnCheckboxArea(event)) return;

    const contactId = contactOption.getAttribute('data-contact-id');
    if (contactId) _selectContact(contactId, container);
}

/**
 * Checks if the click event occurred on the checkbox area.
 * @param {MouseEvent} event - The mouse event to check
 * @returns {boolean} True if click was on checkbox area, false otherwise
 */
function isClickOnCheckboxArea(event) {
    return event.target.closest('.contact-option-checkbox');
}

/**
 * Sets up toggle dropdown event delegation for contact header clicks.
 * @param {MouseEvent} event - The mouse event
 * @param {HTMLElement|null} contactHeader - The contact header element
 * @param {HTMLElement|null} searchInput - The search input element
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function setupToggleDropdownEventDelegation(event, contactHeader, searchInput, container) {
    if (contactHeader) {
        if (!event.target.closest('.contact-search-input')) {
            toggleDropdown('contact', false, container);
        } else if (searchInput) {
            event.stopPropagation();
            toggleDropdown('contact', true, container);
        }
    }
}

/**
 * Handles category option click delegation.
 * @param {HTMLElement|null} categoryOption - The clicked category option element
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function setupCategoryOptionDelegation(categoryOption, container) {
    if (categoryOption) {
        const categoryId = categoryOption.getAttribute('data-category-id');
        if (categoryId) {
            _selectCategory(categoryId, container);
        }
    }
}

/**
 * Sets up event delegation for contact-related events (search input and checkbox changes).
 * @param {HTMLElement} container - The container element to scope events
 * @param {Object} options - Event listener options including AbortSignal
 * @returns {void}
 */
function setupContactEventDelegation(container, options) {
    handleSearchInput(container, options);
    handleCheckboxChange(container, options);
}

/**
 * Handles search input events for filtering contacts.
 * @param {HTMLElement} container - The container element to scope events
 * @param {Object} options - Event listener options including AbortSignal
 * @returns {void}
 */
function handleSearchInput(container, options) {
    container.addEventListener('input', (event) => {
        const isSearchInput = event.target.closest('.contact-search-input');
        if (isSearchInput) _filterOptions(container, toggleDropdown);
    }, options);
}

/**
 * Handles checkbox change events for contact selection.
 * @param {HTMLElement} container - The container element to scope events
 * @param {Object} options - Event listener options including AbortSignal
 * @returns {void}
 */
function handleCheckboxChange(container, options) {
    container.addEventListener('change', (event) => {
        const checkbox = event.target;
        const isContactCheckbox = checkbox.matches('.contact-option-checkbox input[type="checkbox"]');
        if (!isContactCheckbox) return;

        const contactOption = checkbox.closest('.contact-option');
        const contactId = contactOption?.getAttribute('data-contact-id');
        if (contactId) _selectContact(contactId, container);
    }, options);
}

/**
 * Initializes dropdown functionality for a given container.
 * Loads contacts, populates both dropdowns, sets up event delegation and outside-click handling.
 * @param {HTMLElement} container - The container element to scope queries
 * @param {HTMLElement} pageContainer - The main page container for global event delegation
 * @returns {void}
 */
export function initializeDropdowns(container, pageContainer) {
    const signal = renewAbortController(container);

    activeContainer = container;
    setActiveContainerRef(container);

    loadContacts().then(() => populateContactsDropdown(container));
    populateCategoriesDropdown(container);
    setupDropdownEventDelegation(pageContainer, signal);

    pageContainer.addEventListener('click', (event) => closeDropdownOnClickOutside(event, container), {signal});

    container.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllDropdowns(null, container);
    }, {signal});
}

/**
 * Renews the AbortController for a container, aborting any existing controller.
 * @param {HTMLElement} container - The container element to associate with the AbortController
 * @returns {AbortSignal} The signal from the new AbortController
 */
function renewAbortController(container) {
    const existingController = dropdownAbortControllers.get(container);
    if (existingController) existingController.abort();
    const abortController = new AbortController();
    dropdownAbortControllers.set(container, abortController);
    const {signal} = abortController;
    return signal;
}

/**
 * Resets dropdown state completely (both contacts and category).
 * Use this when opening a new dialog/form to start fresh.
 * @returns {void}
 */
export function resetDropdownState() {
    _setSelectedContacts([]);
    _setSelectedCategory(null);
}

// --- Re-exports from contactDropdownManager ---
export {selectContact, preselectContacts, getSelectedContacts, setSelectedContacts} from "./contactDropdownManager.js";

// --- Re-exports from categoryDropdownManager ---
export {selectCategory, preselectCategory, getSelectedCategory, setSelectedCategory} from "./categoryDropdownManager.js";
