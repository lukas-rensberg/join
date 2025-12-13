/**
 * Dropdown Management Functions
 * Handles contact and category dropdown functionality
 */

import { getCategoryOptionHTML, generateContactOptionHTML, getContactChipHTML } from "./template.js";
import { database } from "./database.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

let contacts = [];
let selectedContacts = [];
let selectedCategory = null;

const categories = [
    { id: 'technical', name: 'Technical Task' },
    { id: 'user-story', name: 'User Story' }
];

/**
 * Load contacts from database for dropdown
 */
async function loadContacts() {
    const contactsRef = ref(database, 'contacts');

    onValue(contactsRef, (snapshot) => {
        if (snapshot.exists()) {
            contacts = Object.values(snapshot.val());
            populateContactsDropdown();
        }
    });
}

/**
 * Populate the contacts dropdown with available contacts
 */
function populateContactsDropdown() {
    const dropdownContent = document.getElementById('contactDropdownContent');
    if (!dropdownContent) return;
    dropdownContent.innerHTML = '';
    const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
    sortedContacts.forEach(contact => {
        const contactOption = document.createElement('div');
        contactOption.className = 'contact-option';
        contactOption.setAttribute('data-contact-id', contact.id);
        contactOption.onclick = () => selectContact(contact.id);
        contactOption.innerHTML = generateContactOptionHTML(contact);
        dropdownContent.appendChild(contactOption);
    });
}

/**
 * Select/deselect a contact
 */
export function selectContact(contactId) {
    const isSelected = selectedContacts.find(c => c.id === contactId);
    toggleContactSelection(contactId, isSelected);
    updateSelectedContactsDisplay();
}

/**
 * Toggles contact selection state
 * @param {string} contactId - The contact ID
 * @param {object|null} isSelected - The currently selected contact or null
 * @returns {void}
 */
function toggleContactSelection(contactId, isSelected) {
    const { contact, contactOption, checkbox } = getContactElements(contactId);
    if (!contact || !contactOption || !checkbox) return;

    if (isSelected) {
        selectedContacts = selectedContacts.filter(c => c.id !== contactId);
        contactOption.classList.remove('selected');
        checkbox.classList.remove('checked');
    } else {
        selectedContacts.push(contact);
        contactOption.classList.add('selected');
        checkbox.classList.add('checked');
    }
}

/**
 * Get contact elements by ID
 * @param {string} contactId - The contact ID
 * @returns {object} - Object containing contact, option, and checkbox elements
 */
function getContactElements(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    const contactOption = document.querySelector(`[data-contact-id="${contactId}"]`);
    const checkbox = document.getElementById(`checkbox-${contactId}`);

    return { contact, contactOption, checkbox };
}

/**
 * Update the display of selected contacts
 */
function updateSelectedContactsDisplay() {
    const dropzone = document.querySelector('.dropzone');
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
 */
function populateCategoriesDropdown() {
    const dropdownContent = document.getElementById('categoryDropdownContent');
    if (!dropdownContent) return;

    dropdownContent.innerHTML = `
        <div class="category-option" data-category-id="technical" onclick="selectCategory('technical')">
            ${getCategoryOptionHTML({id: 'technical', name: 'Technical Task'})}
        </div>
        <div class="category-option" data-category-id="user-story" onclick="selectCategory('user-story')">
            ${getCategoryOptionHTML({id: 'user-story', name: 'User Story'})}
        </div>
    `;
}

/**
 * Select a category
 */
export function selectCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    const categoryDisplay = document.getElementById('categoryDisplay');
    if (!category) return;

    selectedCategory = category;
    categoryDisplay.textContent = category.name;

    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }

    toggleDropdown('category', false);
}

/**
 * Toggle dropdown visibility
 * @param {string} type - Type of dropdown ('contact' or 'category')
 * @param {boolean} forceOpen - Force dropdown to open
 * @returns {void}
 */
export function toggleDropdown(type, forceOpen = false) {
    const { wrapper, dropdownContent, dropdownHeader } = getDropdownElements(type);
    if (!wrapper || !dropdownContent || !dropdownHeader) return;

    if (forceOpen || !dropdownContent.classList.contains('active')) {
        closeAllDropdowns(type);
        dropdownHeader.classList.add('active');
        dropdownContent.classList.add('active');
        if (type === 'contact') document.getElementById('contactSearchInput').focus();
    } else {
        clearDropdown(type)
    }
}

/**
 * Get dropdown elements by type
 * @param {string} type - Type of dropdown
 * @returns {object} - Object containing wrapper, content, and header elements
 */
function getDropdownElements(type) {
    const wrapper = document.getElementById(`${type}DropdownWrapper`);
    const dropdownContent = document.getElementById(`${type}DropdownContent`);
    const dropdownHeader = wrapper ? wrapper.querySelector('.dropdown-header') : null;

    return { wrapper, dropdownContent, dropdownHeader };
}

/**
 * Close all dropdowns except the specified one
 * @param {null} except - Type to exclude from closing
 * @returns {void}
 */
function closeAllDropdowns(except = null) {
    const types = ['contact', 'category'];

    types.forEach(type => {
        if (type !== except && type === 'contact') {
            clearDropdown(type);
            filterOptions('contact');
        }
    });
}

/**
 * Clear the dropdown section
 * @param {string} type - Type of dropdown to clear
 * @returns {void}
 */
function clearDropdown(type) {
    const { dropdownContent, dropdownHeader } = getDropdownElements(type);
    if (!dropdownContent || !dropdownHeader) return;
    const searchInput = document.getElementById('contactSearchInput');

    dropdownContent.classList.remove('active');
    dropdownHeader.classList.remove('active');
    searchInput.value = '';
}

/**
 * Filter options based on search input
 * @param {string} type - Type of dropdown to filter
 * @returns {void}
 */
export function filterOptions(type) {
    if (type === 'contact') {
        const searchTerm = document.getElementById('contactSearchInput').value.toLowerCase();
        const contactOptions = document.querySelectorAll('.contact-option');

        contactOptions.forEach(option => {
            const name = option.querySelector('.contact-option-name').textContent.toLowerCase();
            name.includes(searchTerm) ? option.style.display = 'flex' : option.style.display = 'none';
        });

        if (searchTerm.length > 0) toggleDropdown('contact', true);
    }
}

/**
 * Close dropdown when clicking outside
 * @param {MouseEvent} event - The mouse event
 * @returns {void}
 */
function closeDropdownOnClickOutside(event) {
    const types = ['contact', 'category'];

    types.forEach(type => {
        const { wrapper, dropdownContent, dropdownHeader } = getDropdownElements(type);

        if (!wrapper || !dropdownContent || !dropdownHeader) return;

        if (!wrapper.contains(event.target) && type === 'contact') {
            clearDropdown(type);
        }
    });
}

/**
 * Initialize dropdown functionality
 * @returns {void}
 */
export function initializeDropdowns() {
    loadContacts();
    populateCategoriesDropdown();

    document.addEventListener('click', closeDropdownOnClickOutside);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllDropdowns();
        }
    });
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
