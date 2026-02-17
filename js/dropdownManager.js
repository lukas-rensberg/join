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
function populateContactsDropdown(container) {
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
export function selectContact(contactId, container) {
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
function toggleContactSelection(contactId, isSelected, container) {
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
function getContactElements(contactId, container) {
    const contact = contacts.find(c => c.id === contactId);
    const contactOption = container.querySelector(`[data-contact-id="${contactId}"]`);
    const checkbox = contactOption?.querySelector(`input[type="checkbox"]`);

    return {contact, contactOption, checkbox};
}

/**
 * Update the display of selected contacts
 * @param {HTMLElement} container - The container element to scope queries
 */
function updateSelectedContactsDisplay(container) {
    const dropzone = container.querySelector('.dropzone');
    if (!dropzone) return;

    dropzone.innerHTML = '';

    if (selectedContacts.length >= 5) {
        for (let i = 0; i < selectedContacts.length; i++) {
            if (i < 5) appendContactChip(selectedContacts[i], dropzone);
        }

        const overflowCount = selectedContacts.length - 5;
        if (overflowCount > 0) generateOverflowChip(overflowCount, dropzone);
    } else {
        selectedContacts.forEach(contact => {
            appendContactChip(contact, dropzone);
        });
    }
}

function generateOverflowChip(count, dropzone) {
    const overflowChip = document.createElement('div');
    overflowChip.className = 'contact-chip overflow';
    overflowChip.textContent = `+${count}`;
    dropzone.appendChild(overflowChip);
}

function appendContactChip(contact, dropzone) {
    const contactChip = document.createElement('div');
    contactChip.className = 'contact-chip';
    contactChip.innerHTML = getContactChipHTML(contact);
    dropzone.appendChild(contactChip);
}

/**
 * Populate the category dropdown with available categories
 * @param {HTMLElement} container - The container element to scope queries
 */
function populateCategoriesDropdown(container) {
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
export function selectCategory(categoryId, container) {
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
export function toggleDropdown(type, forceOpen = false, container) {
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
function getDropdownElements(type, container) {
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
function closeAllDropdowns(except = null, container) {
    const types = ['contact', 'category'];

    types.forEach(type => {
        if (type !== except) {
            clearDropdown(type, container);
            if (type === 'contact') filterOptions('contact', container);
        }
    });
}

/**
 * Clear the dropdown section
 * @param {string} type - Type of dropdown to clear
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function clearDropdown(type, container) {
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
export function filterOptions(type, container) {
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
function closeDropdownOnClickOutside(event, container) {
    const isClickInsideContact = event.target.closest('.contact-dropdown-wrapper');
    const isClickInsideCategory = event.target.closest('.category-dropdown-wrapper');

    if (!isClickInsideContact) clearDropdown('contact', container);
    if (!isClickInsideCategory) clearDropdown('category', container);
}

/**
 * Setup event delegation for dropdowns
 * @param {HTMLElement} container - The container element to scope events
 * @param {AbortSignal} signal - AbortSignal for cleanup
 */
function setupDropdownEventDelegation(container, signal = null) {
    const options = signal ? {signal} : {};

    container.addEventListener('click', (event) => {
        const {contactHeader, searchInput, categoryHeader, contactOption, categoryOption} = closestEvents(event)

        setupToggleDropdownEventDelegation(event, contactHeader, searchInput, container)

        if (categoryHeader) return toggleDropdown('category', false, container);
        setupContactOptionDelegation(contactOption, container, event);
        setupCategoryOptionDelegation(categoryOption, container);
    }, options);
    setupContactEventDelegation(container, options);
}

function closestEvents(event) {
    const contactHeader = event.target.closest('.contact-dropdown-header');
    const searchInput = event.target.closest('.contact-search-input');
    const categoryHeader = event.target.closest('.category-dropdown-header');
    const contactOption = event.target.closest('.contact-option');
    const categoryOption = event.target.closest('.category-option');
    return {contactHeader, searchInput, categoryHeader, contactOption, categoryOption};
}

function setupContactOptionDelegation(contactOption, container, event) {
    if (!contactOption) return;
    if (isClickOnCheckboxArea(event)) return;

    const contactId = contactOption.getAttribute('data-contact-id');
    if (contactId) selectContact(contactId, container);
}

function isClickOnCheckboxArea(event) {
    return event.target.closest('.contact-option-checkbox');
}

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

function setupCategoryOptionDelegation(categoryOption, container) {
    if (categoryOption) {
        const categoryId = categoryOption.getAttribute('data-category-id');
        if (categoryId) {
            selectCategory(categoryId, container);
        }
    }
}

function setupContactEventDelegation(container, options) {
    handleSearchInput(container, options);
    handleCheckboxChange(container, options);
}

function handleSearchInput(container, options) {
    container.addEventListener('input', (event) => {
        const isSearchInput = event.target.closest('.contact-search-input');
        if (isSearchInput) filterOptions('contact', container);
    }, options);
}

function handleCheckboxChange(container, options) {
    container.addEventListener('change', (event) => {
        const checkbox = event.target;
        const isContactCheckbox = checkbox.matches('.contact-option-checkbox input[type="checkbox"]');
        if (!isContactCheckbox) return;

        const contactOption = checkbox.closest('.contact-option');
        const contactId = contactOption?.getAttribute('data-contact-id');
        if (contactId) selectContact(contactId, container);
    }, options);
}

/**
 * Initialize dropdown functionality
 * @param {HTMLElement} container - The container element to scope queries
 * @param {HTMLElement} pageContainer - The main page container for global event delegation
 * @returns {void}
 */
export function initializeDropdowns(container, pageContainer) {
    const signal = renewAbortController(container);

    activeContainer = container;

    loadContacts().then(() => populateContactsDropdown(container));
    populateCategoriesDropdown(container);
    setupDropdownEventDelegation(pageContainer, signal);

    pageContainer.addEventListener('click', (event) => closeDropdownOnClickOutside(event, container), {signal});

    container.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllDropdowns(null, container)
    }, {signal});
}

function renewAbortController(container) {
    const existingController = dropdownAbortControllers.get(container);
    if (existingController) existingController.abort();
    const abortController = new AbortController();
    dropdownAbortControllers.set(container, abortController);
    const {signal} = abortController;
    return signal;
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
export async function preselectContacts(memberIds, container) {
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
 * @param {string} taskType - The task type name (e.g., "User Story", "Technical Task")
 * @param {HTMLElement|Document} container - The container element to scope queries
 */
export function preselectCategory(taskType, container) {
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
