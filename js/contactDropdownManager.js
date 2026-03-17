/**
 * @fileoverview Manages the contact dropdown: loading contacts from Firebase,
 * populating the dropdown list, handling selection/deselection, chip rendering,
 * search filtering, and preselection of members.
 */

import {generateContactOptionHTML, getContactChipHTML} from "./template.js";
import {database} from "./database.js";
import {ref, onValue} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

/** @type {Array<Object>} All contacts loaded from Firebase */
let contacts = [];

/** @type {Array<Object>} Currently selected contacts */
let selectedContacts = [];

/** @type {boolean} Whether contacts have been loaded at least once */
let contactsLoaded = false;

/** @type {Promise<void>|null} Pending promise for the initial contact load */
let contactsLoadedPromise = null;

/** @type {HTMLElement|null} Reference to the currently active container, set by initializeDropdowns */
let activeContainerRef = null;

/**
 * Sets the active container reference used by the Firebase listener callback.
 * Called from dropdownManager during initialization.
 * @param {HTMLElement|null} container - The active container element
 * @returns {void}
 */
export function setActiveContainerRef(container) {
    activeContainerRef = container;
}

/**
 * Loads contacts from the Firebase database for the dropdown.
 * The Firebase listener is registered only once; subsequent calls use cached data.
 * @returns {Promise<void>} Promise that resolves when contacts are loaded
 */
export function loadContacts() {
    if (contactsLoaded && contacts.length > 0) return Promise.resolve();
    if (contactsLoadedPromise) return contactsLoadedPromise;

    return contactsLoadedPromise = new Promise((resolve) => {
        const contactsRef = ref(database, 'contacts');

        onValue(contactsRef, (snapshot) => {
            if (!snapshot.exists()) return;
            contacts = Object.values(snapshot.val());
            contactsLoaded = true;
            if (!activeContainerRef) return;
            populateContactsDropdown(activeContainerRef);
            resolve();
        });
    });
}

/**
 * Populates the contacts dropdown with available contacts, sorted alphabetically.
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function populateContactsDropdown(container) {
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
 * Selects or deselects a contact and updates the chip display.
 * @param {string} contactId - The contact ID to toggle
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function selectContact(contactId, container) {
    const isSelected = selectedContacts.some(c => c.id === contactId);
    toggleContactSelection(contactId, isSelected, container);
    updateSelectedContactsDisplay(container);
}

/**
 * Toggles a contact's selection state in the dropdown and updates the checkbox.
 * @param {string} contactId - The contact ID
 * @param {boolean} isSelected - Whether the contact is currently selected
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
function toggleContactSelection(contactId, isSelected, container) {
    const {contact, contactOption, checkbox} = getContactElements(contactId, container);
    if (!contact || !contactOption || !checkbox) return;

    if (isSelected) {
        selectedContacts = selectedContacts.filter(c => c.id !== contactId);
        contactOption.classList.remove('selected');
        checkbox.checked = false;
    } else {
        selectedContacts.push(contact);
        contactOption.classList.add('selected');
        checkbox.checked = true;
    }
}

/**
 * Retrieves the contact data object, DOM option element, and checkbox for a given contact ID.
 * @param {string} contactId - The contact ID
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {{contact: Object|undefined, contactOption: HTMLElement|null, checkbox: HTMLInputElement|null}}
 */
function getContactElements(contactId, container) {
    const contact = contacts.find(c => c.id === contactId);
    const contactOption = container.querySelector(`[data-contact-id="${contactId}"]`);
    const checkbox = contactOption?.querySelector('input[type="checkbox"]');

    return {contact, contactOption, checkbox};
}

/**
 * Updates the display of selected contact chips in the dropzone.
 * Shows up to 5 chips and an overflow indicator for additional contacts.
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
export function updateSelectedContactsDisplay(container) {
    const dropzone = container.querySelector('.dropzone');
    if (!dropzone) return;

    dropzone.innerHTML = '';

    for (let i = 0; i < selectedContacts.length; i++) {
        if (i < 5) appendContactChip(selectedContacts[i], dropzone);
    }

    const overflowCount = selectedContacts.length - 5;
    if (overflowCount > 0) generateOverflowChip(overflowCount, dropzone);
}

/**
 * Creates and appends an overflow chip showing the count of additional contacts.
 * @param {number} count - The number of additional contacts beyond the visible limit
 * @param {HTMLElement} dropzone - The dropzone element to append the chip to
 * @returns {void}
 */
function generateOverflowChip(count, dropzone) {
    const overflowChip = document.createElement('div');
    overflowChip.className = 'contact-chip overflow';
    overflowChip.textContent = `+${count}`;
    dropzone.appendChild(overflowChip);
}

/**
 * Creates and appends a single contact chip element to the dropzone.
 * @param {Object} contact - The contact object containing avatar and name info
 * @param {HTMLElement} dropzone - The dropzone element to append the chip to
 * @returns {void}
 */
function appendContactChip(contact, dropzone) {
    const contactChip = document.createElement('div');
    contactChip.className = 'contact-chip';
    contactChip.innerHTML = getContactChipHTML(contact);
    dropzone.appendChild(contactChip);
}

/**
 * Filters contact options in the dropdown based on the search input value.
 * Opens the contact dropdown if a search term is present.
 * @param {HTMLElement} container - The container element to scope queries
 * @param {Function} toggleDropdownFn - Reference to the toggleDropdown function
 * @returns {void}
 */
export function filterOptions(container, toggleDropdownFn) {
    const searchInput = container.querySelector('.contact-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const contactOptions = container.querySelectorAll('.contact-option');

    contactOptions.forEach(option => {
        const name = option.querySelector('.contact-option-name').textContent.toLowerCase();
        name.includes(searchTerm) ? option.style.display = 'flex' : option.style.display = 'none';
    });

    if (searchTerm.length > 0) toggleDropdownFn('contact', true, container);
}

/**
 * Waits for contacts to be loaded, then preselects the given member IDs.
 * Clears any previous selection before applying the new preselection.
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

/**
 * Handles the preselection of a single member by contact ID.
 * Adds the contact to selectedContacts and updates the DOM checkbox/class.
 * @param {string} contactId - The contact ID to preselect
 * @param {HTMLElement} container - The container element to scope queries
 * @returns {void}
 */
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
 * Returns the array of currently selected contacts.
 * @returns {Array<Object>} Array of selected contact objects
 */
export function getSelectedContacts() {
    return selectedContacts;
}

/**
 * Replaces the array of currently selected contacts.
 * @param {Array<Object>} value - The new array of selected contacts
 * @returns {void}
 */
export function setSelectedContacts(value) {
    selectedContacts = value;
}

