import {ref, remove} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import {database} from "../js/database.js";
import {showInlineError} from "../js/errorHandler.js";

export let contacts = [];
export let currentContactId = null;
export const desktopMediaQuery = window.matchMedia("(min-width: 812px)");
const detailViewDesktop = document.getElementById("contactDetailViewDesktop");
const detailViewMobile = document.getElementById("contactDetailView");

/**
 * Checks if the current viewport is desktop size
 * @returns {boolean} True if viewport width >= 1450px
 */
export function isDesktop() {
    return desktopMediaQuery.matches;
}

/**
 * Handles FAB (floating action button) click - shows either the add or edit menu depending on view
 */
export function handleFabClick() {
    const detailView = document.getElementById("contactDetailView");
    if (detailView.classList.contains("active")) {
        toggleFabMenu();
    } else {
        openContactModal(false);
    }
}

/**
 * Toggles the FAB (floating action button) menu visibility
 */
function toggleFabMenu() {
    const fabMenu = document.getElementById("fabMenu");
    if (fabMenu) {
        fabMenu.classList.toggle("active");
    }
}

/**
 * Closes the FAB (floating action button) menu
 */
export function closeFabMenu() {
    const fabMenu = document.getElementById("fabMenu");
    if (fabMenu) {
        fabMenu.classList.remove("active");
    }
}

/**
 * Setup click outside listener for FAB (floating action button) menu
 */
export function setupClickOutsideListener() {
    document.addEventListener("click", function (event) {
        const fabButton = document.getElementById("fabButton");
        const fabMenu = document.getElementById("fabMenu");

        if (
            fabButton && fabMenu && !fabButton.contains(event.target) && !fabMenu.contains(event.target)
        ) {
            closeFabMenu();
        }
    });
}

/**
 * Shows the contact detail view with the provided contact ID
 * @param {string} contactId - Contact's unique ID
 * @returns {void}
 */
export function showContactDetail(contactId) {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    currentContactId = contactId;

    if (isDesktop()) {
        showContactDetailDesktop(contact, contactId);
    } else {
        showContactDetailMobile(contact, contactId);
    }
}

/**
 * Shows the contact detail view on desktop
 * @param {Object} contact - The contact object to display
 * @param {string} contactId - Contact's unique ID
 * @returns {void}
 */
function showContactDetailDesktop(contact, contactId) {

    detailViewMobile.classList.remove("active");
    updateContactDetailViews(contact, contactId);
    superToggle(detailViewDesktop, "hidden", "active");

    const contactsSection = document.querySelector(".contacts-section");
    if (contactsSection) contactsSection.classList.add("hidden");
}

/**
 * Shows the contact detail view on mobile devices
 * @param {Object} contact - The contact object to display
 * @param {string} contactId - Contact's unique ID
 * @returns {void}
 */
function showContactDetailMobile(contact, contactId) {

    detailViewDesktop.classList.remove("active");
    updateContactDetailViews(contact, contactId);
    detailViewMobile.classList.add("active");

    const fabIcon = document.getElementById("fabIcon");
    fabIcon.src = "./assets/icons/more-vertical.svg";
    fabIcon.alt = "Menu";
}

/**
 * Updates both mobile and desktop contact detail views
 * @param {Object} contact - Contact object
 * @param {string} contactId - Contact's unique ID
 */
function updateContactDetailViews(contact, contactId) {
    populateContactDetailView(contact);
    populateContactDetailViewDesktop(contact);

    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));
    const activeItem = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (activeItem) activeItem.classList.add("active");
}

/**
 * Populates the contact detail view with contact data (mobile only)
 * @param {Object} contact - Contact object
 */
function populateContactDetailView(contact) {
    document.getElementById("detailName").textContent = contact.name;
    document.getElementById("detailEmail").textContent = contact.email;
    document.getElementById("detailPhone").textContent = contact.phone;

    const avatar = document.getElementById("detailAvatar");
    avatar.textContent = contact.initials;
    avatar.style.backgroundColor = contact.avatarColor;

    const fabIcon = document.getElementById("fabIcon");
    fabIcon.src = "./assets/icons/more-vertical.svg";
    fabIcon.alt = "Menu";
}

/**
 * Populates the desktop contact detail view with contact data
 * @param {Object} contact - Contact object
 */
function populateContactDetailViewDesktop(contact) {
    document.getElementById("detailNameDesktop").textContent = contact.name;
    document.getElementById("detailEmailDesktop").textContent = contact.email;
    document.getElementById("detailPhoneDesktop").textContent = contact.phone;

    const avatar = document.getElementById("detailAvatarDesktop");
    avatar.textContent = contact.initials;
    avatar.style.backgroundColor = contact.avatarColor;
}

/**
 * Hides the contact detail view and shows the contact list
 */
export function hideContactDetail() {
    document.getElementById("contactDetailView").classList.remove("active");
    superToggle(document.getElementById("contactDetailViewDesktop"), "active", "hidden");
    document.querySelector(".contacts-container").style.display = "block";

    const contactsSection = document.querySelector(".contacts-section");
    if (contactsSection) contactsSection.classList.remove("hidden");

    document.querySelectorAll(".contact-item").forEach(item => item.classList.remove("active"));

    const fabIcon = document.getElementById("fabIcon");
    fabIcon.src = "./assets/icons/person_add.svg";
    fabIcon.alt = "Add Contact";

    document.getElementById("fabMenu").classList.remove("active");
    currentContactId = null;
}

/**
 * Deletes a contact according to the currentContactId
 * @returns void
 */
export async function deleteContact() {
    try {
        await remove(ref(database, `contacts/${currentContactId}`));

        if (typeof window.removeContactFromAllTasks === 'function') {
            await window.removeContactFromAllTasks(currentContactId);
        }

        hideContactDetail();
        closeFabMenu();
    } catch (error) {
        showInlineError("Failed to delete contact. Please try again.");
    }
}

export let isEditMode = false;
export const contactModal = document.getElementById("contactModal");
export const modalHeader = document.querySelector(".modal-header");
const cancelButton = document.getElementById("cancelButton");

/**
 * Set up an event listener to open the Add-Contact modal when clicking on the add-contact button (desktop-only)
 */
export function setupAddContactBtnEventListener() {
    document.getElementById("addContactBtn").addEventListener("click", (event) => {
        event.preventDefault();
        openContactModal(false);
    })
}

/**
 * Handles editing a contact - opens the modal in edit mode
 */
export function editContact() {
    if (!currentContactId) return;
    openContactModal(true);
}

/**
 * Handles media query changes and updates the modal UI live
 * @param {MediaQueryListEvent} event - The media query change event
 */
export function handleMediaQueryChange(event) {

    if (isEditMode) {
        if (event.matches) {
            contactModal.classList.remove("contact-modal", "dialog-swipe-in", "add-modal-header");
            contactModal.classList.add("edit-contact-modal", "edit-dialog-swipe-in");
        } else {
            contactModal.classList.remove("edit-contact-modal", "edit-dialog-swipe-in", "edit-modal-header");
            contactModal.classList.add("contact-modal", "dialog-swipe-in");
            modalHeader.classList.add("edit-modal-header");
        }
        return;
    }
    event.matches ? cancelButton.style.display = "block" : cancelButton.style.display = "none";
}

/**
 * Opens the contact modal in either create or edit mode
 * @param {boolean} editMode - Whether to open in edit mode (true) or create mode (false)
 */
function openContactModal(editMode) {
    isEditMode = editMode;
    if (isEditMode) {
        const contact = findContactById(currentContactId);
        if (!contact) return;
        setupEditContactModal(contact);

        if (isDesktop()) {
            openContactModalDesktop();
        } else {
            contactModal.classList.add("contact-modal");
            contactModal.classList.add("dialog-swipe-in");
        }
    } else {
        setupAddContactModal();
        openContactModalMobile();
    }
    contactModal.showModal();
}

/**
 * Opens the contact modal with desktop-specific styling for edit mode
 * @returns {void}
 */
function openContactModalDesktop() {
    contactModal.classList.add("edit-contact-modal");
    contactModal.classList.add("edit-dialog-swipe-in");
    modalHeader.classList.remove("add-modal-header")
    modalHeader.classList.add("edit-modal-header")
}

/**
 * Opens the contact modal with mobile-specific styling
 * @returns {void}
 */
function openContactModalMobile() {
    contactModal.classList.add("contact-modal");
    contactModal.classList.add("dialog-swipe-in");
    modalHeader.classList.remove("edit-modal-header");
    modalHeader.classList.add("add-modal-header")
}



/**
 * Finds a contact by its ID
 * @param {string} contactId - Contact's unique ID
 * @returns {Object|null} Contact object or null if not found
 */
function findContactById(contactId) {
    if (!contactId) return null;
    return contacts.find((c) => c.id === contactId);
}

/**
 * Sets up the contact modal for editing an existing contact
 * @param {Object} contact The contact object to be edited
 * @returns {void}
 */
function setupEditContactModal(contact) {
    document.getElementById("modalTitle").textContent = "Edit contact";
    document.getElementById("saveButtonText").textContent = "Save";
    document.getElementById("cancelButton").style.display = "none";
    document.getElementById("deleteButton").style.display = "flex";
    populateModalWithContactData(contact);
    closeFabMenu();
}

/**
 * Sets up the contact modal for adding a new contact
 * @returns {void}
 */
function setupAddContactModal() {
    document.getElementById("modalTitle").textContent = "Add contact";
    document.getElementById("saveButtonText").textContent = "Create contact";
    document.getElementById("deleteButton").style.display = "none";

    if (!isDesktop()) {
        cancelButton.style.display = "none";
    } else {
        cancelButton.style.display = "flex";
    }

    clearModalFormFields();
    generateModalAvatar();
}

/**
 * Populates the contact modal with contact data
 * @param {Object} contact The contact object to populate the modal with
 * @return {void}
 */
function populateModalWithContactData(contact) {
    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactEmail").value = contact.email;
    document.getElementById("contactPhone").value = contact.phone;

    generateModalAvatar(contact);
}

/**
 * Clears the contact modal form fields
 * @return {void}
 */
function clearModalFormFields() {
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";
}

/**
 * Generates the modal avatar based on contact data or default state
 * @param {Object} [contact] The contact object
 * @return {void}
 */
function generateModalAvatar(contact) {
    const modalAvatar = document.getElementById("modalAvatar");

    if (!contact) {
        modalAvatar.textContent = '';
        while (modalAvatar.firstChild) {
            modalAvatar.removeChild(modalAvatar.firstChild);
        }
        modalAvatar.classList.add("avatar-default");
        return;
    }

    modalAvatar.textContent = contact.initials;
    modalAvatar.style.backgroundColor = contact.avatarColor;
}

/**
 * Sets the contacts array with new data
 * @param newContacts
 */
export function setContacts(newContacts) {
    contacts = newContacts;
}

/**
 * Sets the contacts array with new data
 */
export function getContacts() {
    return contacts;
}


/**
 * Sets the edit mode state
 * @param {boolean} value - True for edit mode, false for add mode
 * @return {void}
 */
export function setEditMode(value) {
    isEditMode = value;
}

/**
 * Gets the edit mode state
 * @return {boolean} True if in edit mode, false if in add mode
 */
export function getEditMode() {
    return isEditMode;
}

/**
 * Sets the current contact ID being viewed or edited
 * @param value
 * @return {void}
 */
export function setCurrentContactId(value) {
    currentContactId = value;
}

/**
 * Gets the current contact ID being viewed or edited
 * @return {string|null} The current contact ID or null if none is selected
 */
export function getCurrentContactId() {
    return currentContactId;
}
