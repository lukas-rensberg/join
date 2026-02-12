/**
 * Dropdown Management Functions
 * Handles contact and category dropdown functionality with scoped container support
 */

// todo: File too long, split into smaller modules if possible

import {getCategoryOptionHTML, generateContactOptionHTML, getContactChipHTML} from "./template.js";
import {database} from "./database.js";
import {ref, onValue} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

let contacts = [];
let selectedContacts = [];
let selectedCategory = null;
let activeContainer = null;
let contactsLoaded = false;
let contactsLoadedPromise = null;
const dropdownAbortControllers = new WeakMap();

const categories = [
    {id: 'technical', name: 'Technical Task'},
    {id: 'user-story', name: 'User Story'}
];

/**
 * Load contacts from database for dropdown (with caching)
 * Firebase listener is registered only once, subsequent calls use cached data
 * @returns {Promise<void>} - Promise that resolves when contacts are loaded
 */
function loadContacts() {
    if (contactsLoaded && contacts.length > 0) return Promise.resolve();

    if (contactsLoadedPromise) return contactsLoadedPromise;

    contactsLoadedPromise = new Promise((resolve) => {
        const contactsRef = ref(database, 'contacts');

        onValue(contactsRef, (snapshot) => {
            if (!snapshot.exists()) return;
            contacts = Object.values(snapshot.val());
            contactsLoaded = true;
            if (!activeContainer) return;
            populateContactsDropdown(activeContainer);
            resolve();
        });
    });
    return contactsLoadedPromise;
}

/**
 * Populate the contacts dropdown with available contacts
 * @param {HTMLElement} container - The container element to scope queries
 */
function populateContactsDropdown(container = document) {
    const dropdownContent = container.querySelector('.contact-dropdown-content');
    if (!dropdownContent) return;
    dropdownContent.innerHTML = '';
    const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
    sortedContacts.forEach(contact => {
        const contactOption = document.createElement('div');
        contactOption.className = 'contact-option';
        contactOption.setAttribute('data-contact-id', contact.id);
        contactOption.innerHTML = generateContactOptionHTML(contact);
        dropdownContent.appendChild(contactOption);
    });
}

/**
 * Select/deselect a contact
 * @param {string} contactId - The contact ID
 * @param {HTMLElement} container - The container element to scope queries
 */
export function selectContact(contactId, container = document) {
    const isSelected = selectedContacts.some(c => c.id === contactId);
    toggleContactSelection(contactId, isSelected, container);
    updateSelectedContactsDisplay(container);
}

/**
 * Toggles contact selection state
 * @param {string} contactId - The contact ID
 * @param {object|null} isSelected - The currently selected contact or null
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function toggleContactSelection(contactId, isSelected, container = document) {
    const {contact, contactOption, checkbox} = getContactElements(contactId, container);
    if (!contact || !contactOption || !checkbox) return;

    if (isSelected) {
        selectedContacts = selectedContacts.filter(contact => contact.id !== contactId);
        contactOption.classList.remove('selected');
        checkbox.checked = false;
    } else {
        selectedContacts.push(contact);
        contactOption.classList.add('selected');
        checkbox.checked = true;
    }
}

/**
 * Get contact elements by ID
 * @param {string} contactId - The contact ID
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {object} - Object containing contact, option, and checkbox elements
 */
function getContactElements(contactId, container = document) {
    const contact = contacts.find(c => c.id === contactId);
    const contactOption = container.querySelector(`[data-contact-id="${contactId}"]`);
    const checkbox = contactOption?.querySelector(`input[type="checkbox"]`);

    return {contact, contactOption, checkbox};
}

/**
 * Update the display of selected contacts
 * @param {HTMLElement} container - The container element to scope queries
 */
function updateSelectedContactsDisplay(container = document) {
    const dropzone = container.querySelector('.dropzone');
    if (!dropzone) return;

    dropzone.innerHTML = '';

    selectedContacts.forEach(contact => {
        const contactChip = document.createElement('div');
        contactChip.className = 'contact-chip';
        contactChip.innerHTML = getContactChipHTML(contact);
        dropzone.appendChild(contactChip);
    });
}

/**
 * Populate the category dropdown with available categories
 * @param {HTMLElement} container - The container element to scope queries
 */
function populateCategoriesDropdown(container = document) {
    const dropdownContent = container.querySelector('.category-dropdown-content');
    if (!dropdownContent) return;

    dropdownContent.innerHTML = `
        <div class="category-option" data-category-id="technical">
            ${getCategoryOptionHTML({id: 'technical', name: 'Technical Task'})}
        </div>
        <div class="category-option" data-category-id="user-story">
            ${getCategoryOptionHTML({id: 'user-story', name: 'User Story'})}
        </div>
    `;
}

/**
 * Select a category
 * @param {string} categoryId - The category ID
 * @param {HTMLElement} container - The container element to scope queries
 */
export function selectCategory(categoryId, container = document) {
    const category = categories.find(c => c.id === categoryId);
    const categoryDisplay = container.querySelector('.category-display');
    if (!category) return;

    selectedCategory = category;
    categoryDisplay.textContent = category.name;

    container.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = container.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }

    toggleDropdown('category', false, container);
}

/**
 * Toggle dropdown visibility
 * @param {string} type - Type of dropdown ('contact' or 'category')
 * @param {boolean} forceOpen - Force dropdown to open
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function toggleDropdown(type, forceOpen = false, container = document) {
    const {wrapper, dropdownContent, dropdownHeader} = getDropdownElements(type, container);
    if (!wrapper || !dropdownContent || !dropdownHeader) return;

    if (forceOpen || !dropdownContent.classList.contains('active')) {
        closeAllDropdowns(type, container);
        dropdownHeader.classList.add('active');
        dropdownContent.classList.add('active');
        if (type === 'contact') {
            const searchInput = container.querySelector('.contact-search-input');
            if (searchInput) searchInput.focus();
        }
    } else {
        clearDropdown(type, container);
    }
}

/**
 * Get dropdown elements by type
 * @param {string} type - Type of dropdown
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {object} - Object containing wrapper, content, and header elements
 */
function getDropdownElements(type, container = document) {
    const wrapper = container.querySelector(`.${type}-dropdown-wrapper`);
    const dropdownContent = container.querySelector(`.${type}-dropdown-content`);
    const dropdownHeader = wrapper ? wrapper.querySelector('.dropdown-header') : null;

    return {wrapper, dropdownContent, dropdownHeader};
}

/**
 * Close all dropdowns except the specified one
 * @param {string|null} except - Type to exclude from closing
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function closeAllDropdowns(except = null, container = document) {
    const types = ['contact', 'category'];

    types.forEach(type => {
        if (type !== except && type === 'contact') {
            clearDropdown(type, container);
            filterOptions('contact', container);
        }
    });
}

/**
 * Clear the dropdown section
 * @param {string} type - Type of dropdown to clear
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function clearDropdown(type, container = document) {
    const {dropdownContent, dropdownHeader} = getDropdownElements(type, container);
    if (!dropdownContent || !dropdownHeader) return;
    const searchInput = container.querySelector('.contact-search-input');

    dropdownContent.classList.remove('active');
    dropdownHeader.classList.remove('active');
    if (searchInput) searchInput.value = '';
}

/**
 * Filter options based on search input
 * @param {string} type - Type of dropdown to filter
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function filterOptions(type, container = document) {
    if (type === 'contact') {
        const searchInput = container.querySelector('.contact-search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const contactOptions = container.querySelectorAll('.contact-option');

        contactOptions.forEach(option => {
            const name = option.querySelector('.contact-option-name').textContent.toLowerCase();
            name.includes(searchTerm) ? option.style.display = 'flex' : option.style.display = 'none';
        });

        if (searchTerm.length > 0) toggleDropdown('contact', true, container);
    }
}

/**
 * Close dropdown when clicking outside
 * @param {MouseEvent} event - The mouse event
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function closeDropdownOnClickOutside(event, container = document) {
    const types = ['contact', 'category'];
    types.forEach(type => {
        const {wrapper, dropdownContent, dropdownHeader} = getDropdownElements(type, container);

        if (!wrapper || !dropdownContent || !dropdownHeader) return;

        if (!wrapper.contains(event.target) && type) {
            clearDropdown(type, container);
        }
    });
}

/**
 * Setup event delegation for dropdowns
 * @param {HTMLElement} container - The container element to scope events
 * @param {AbortSignal} signal - AbortSignal for cleanup
 */
function setupDropdownEventDelegation(container = document, signal = null) {
    const options = signal ? {signal} : {};

    container.addEventListener('click', (event) => {
        const contactHeader = event.target.closest('.contact-dropdown-header');
        if (contactHeader && !event.target.closest('.contact-search-input')) {
            toggleDropdown('contact', false, container);
            return;
        }

        const searchInput = event.target.closest('.contact-search-input');
        if (searchInput) {
            event.stopPropagation();
            toggleDropdown('contact', true, container);
            return;
        }

        const categoryHeader = event.target.closest('.category-dropdown-header');
        if (categoryHeader) {
            toggleDropdown('category', false, container);
            return;
        }

        const contactOption = event.target.closest('.contact-option');
        if (contactOption) {
            const contactId = contactOption.getAttribute('data-contact-id');
            if (contactId) {
                selectContact(contactId, container);
            }
            return;
        }

        const categoryOption = event.target.closest('.category-option');
        if (categoryOption) {
            const categoryId = categoryOption.getAttribute('data-category-id');
            if (categoryId) {
                selectCategory(categoryId, container);
            }
        }
    }, options);

    container.addEventListener('input', (event) => {
        if (event.target.closest('.contact-search-input')) {
            filterOptions('contact', container);
        }
    }, options);
}

/**
 * Initialize dropdown functionality
 * @param {HTMLElement} container - The container element to scope queries (default: document)
 * @returns {void}
 */
export function initializeDropdowns(container = document) {
    const existingController = dropdownAbortControllers.get(container);
    if (existingController) {
        existingController.abort();
    }

    const abortController = new AbortController();
    dropdownAbortControllers.set(container, abortController);
    const {signal} = abortController;

    activeContainer = container;

    loadContacts().then(() => {
        populateContactsDropdown(container);
    });

    populateCategoriesDropdown(container);
    setupDropdownEventDelegation(container, signal);

    const eventTarget = container === document ? document : container;

    eventTarget.addEventListener('click', (event) => closeDropdownOnClickOutside(event, container), {signal});

    eventTarget.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllDropdowns(null, container);
        }
    }, {signal});
}

/**
 * Get selected contacts
 * @returns {Array} - Array of selected contacts
 */
export function getSelectedContacts() {
    return selectedContacts;
}

/**
 * Get selected category
 * @returns {object|null} - Selected category or null
 */
export function getSelectedCategory() {
    return selectedCategory;
}

/**
 * Clear selected contacts
 * @returns {void}
 */
export function clearSelectedContacts() {
    selectedContacts = [];
}

/**
 * Clear selected category
 * @returns {void}
 */
export function clearSelectedCategory() {
    selectedCategory = null;
}

/**
 * Reset dropdown state completely (contacts and category)
 * Use this when opening a new dialog/form to start fresh
 * @returns {void}
 */
export function resetDropdownState() {
    selectedContacts = [];
    selectedCategory = null;
}

/**
 * Waits for contacts to be loaded, then preselects the given member IDs
 * @param {string[]} memberIds - Array of contact IDs to preselect
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {Promise<void>}
 */
export async function preselectContacts(memberIds, container = document) {
    if (!memberIds || memberIds.length === 0) return;
    await loadContacts();
    selectedContacts = [];

    container.querySelectorAll('.contact-option').forEach(option => {
        option.classList.remove('selected');
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    });

    memberIds.forEach(contactId => {
        handleMemberPreselection(contactId, container);
    });

    updateSelectedContactsDisplay(container);
}

function handleMemberPreselection(contactId, container) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    selectedContacts.push(contact);

    const contactOption = container.querySelector(`[data-contact-id="${contactId}"]`);
    if (!contactOption) return;
    contactOption.classList.add('selected');

    const checkbox = contactOption.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = true;
}

/**
 * Preselects a category based on task type name
 * Sets the category without opening/toggling the dropdown
 * TODO: Add validation to ensure task type exists before preselection
 * @param {string} taskType - The task type name (e.g., "User Story", "Technical Task")
 * @param {HTMLElement|Document} container - The container element to scope queries
 */
export function preselectCategory(taskType, container = document) {
    if (!taskType) return;
    const categoryMap = {'User Story': 'user-story', 'Technical Task': 'technical'};
    const categoryId = categoryMap[taskType];
    if (!categoryId) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    selectedCategory = category;
    const categoryDisplay = container.querySelector('.category-display');
    if (categoryDisplay) categoryDisplay.textContent = category.name;
    container.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedOption = container.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedOption) selectedOption.classList.add('selected');
}

