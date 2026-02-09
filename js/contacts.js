/**
 * @fileoverview Handles contact management including adding, editing, deleting, and displaying contacts.
 */

// todo: File too long, split into smaller modules if possible

import {updateContact, database, createContact} from "./database.js";
import {getRandomColor} from "../utils/contact.js";
import {ref, remove, onValue} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import {generateSectionTemplate, generateContactItemTemplate} from "./template.js";
import {validateContactForm} from "./contactFormValidation.js";
import {showInlineError} from "./errorHandler.js";

let contacts = [];
let currentContactId = null;
let isEditMode = false;
const desktopMediaQuery = window.matchMedia("(min-width: 1450px)");
const contactModal = document.getElementById("contactModal");
const modalHeader = document.querySelector(".modal-header");
const cancelButton = document.getElementById("cancelButton");
const detailViewDesktop = document.getElementById("contactDetailViewDesktop");
const detailViewMobile = document.getElementById("contactDetailView");

/**
 * Checks if the current viewport is desktop size
 * @returns {boolean} True if viewport width >= 1450px
 */
function isDesktop() {
    return desktopMediaQuery.matches;
}


/**
 * Generates a unique ID for contacts
 * @returns {string} Unique contact ID
 */
export function generateContactId() {
    return (
        "contact_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
}

/**
 * Generate initials from name
 * @param {string} name - The name to generate initials from
 * @returns {string} The initials (up to 2 characters)
 */
export function getInitialsFromName(name) {
    const nameParts = name.trim().split(" ");
    const initials = nameParts
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
        .substring(0, 2);
    return initials || "U";
}

/**
 * Load contacts from RTDB and call the render function
 * @returns void
 */
export async function loadContactsFromRTDB() {
    const contactsRef = ref(database, 'contacts');

    onValue(contactsRef, (snapshot) => {
        if (snapshot.exists()) {
            contacts = Object.values(snapshot.val());
            renderContactsList(contacts);
        }
    });
}

/**
 * Groups contacts by the first letter of their name
 * @param {Array} contactsArray Array of contact objects
 * @returns {Object} Grouped contacts
 */
function groupContactsByFirstLetter(contactsArray) {
    const groupedContacts = {};
    contactsArray.forEach((contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });
    return groupedContacts;
}

/**
 * Renders the contacts list dynamically
 * @param {Array} contactsArray - Array of contact objects
 * @returns {void}
 */
function renderContactsList(contactsArray) {
    const container = document.querySelector(".contacts-container");
    container.innerHTML = "";

    const groupedContacts = groupContactsByFirstLetter(contactsArray);

    const sortedLetters = Object.keys(groupedContacts).sort();

    sortedLetters.forEach((letter) => {
        const section = createContactsPerLetter(letter, groupedContacts);
        container.appendChild(section);
    });
}


/**
 * Creates contact section for a specific letter
 * @param {string} letter The wanted letter of the contacts in this section
 * @param {Object} groupedContacts Contacts grouped by first letter
 * @returns {HTMLElement} Section element with contacts starting with the given letter
 */
function createContactsPerLetter(letter, groupedContacts) {
    const section = createContactSection(letter);

    groupedContacts[letter].sort((a, b) => a.name.localeCompare(b.name));
    groupedContacts[letter].forEach((contact) => {
        const contactItem = document.createElement("div");
        contactItem.className = "contact-item";
        contactItem.setAttribute("data-contact-id", contact.id);
        contactItem.onclick = () => showContactDetail(contact.id);
        contactItem.innerHTML = generateContactItemTemplate(contact);
        section.appendChild(contactItem);
    });

    return section;
}

/**
 * Creates a contact section element
 * @param {string} letter The letter for the section header
 * @returns {HTMLElement} Section element
 */
function createContactSection(letter) {
    const section = document.createElement("div");
    section.className = "contact-section";
    section.innerHTML = generateSectionTemplate(letter);
    return section;
}

/**
 * Handles FAB (floating action button) click - shows either the add or edit menu depending on view
 */
function handleFabClick() {
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
function closeFabMenu() {
    const fabMenu = document.getElementById("fabMenu");
    if (fabMenu) {
        fabMenu.classList.remove("active");
    }
}

/**
 * Set up an event listener to open the Add-Contact modal when clicking on the add-contact button (desktop-only)
 *
 */
function setupAddContactBtnEventListener() {
    document.getElementById("addContactBtn").addEventListener("click", (event) => {
        event.preventDefault();
        openContactModal(false);
    })
}

/**
 * Setup click outside listener for FAB (floating action button) menu
 */
function setupClickOutsideListener() {
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
function showContactDetail(contactId) {
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
    detailViewDesktop.classList.add("active");
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
function hideContactDetail() {
    document.getElementById("contactDetailView").classList.remove("active");
    document.querySelector(".contacts-container").style.display = "block";

    const fabIcon = document.getElementById("fabIcon");
    fabIcon.src = "./assets/icons/person_add.svg";
    fabIcon.alt = "Add Contact";

    document.getElementById("fabMenu").classList.remove("active");
}

/**
 * Handles editing a contact - opens the modal in edit mode
 */
function editContact() {
    if (!currentContactId) return;
    openContactModal(true);
}

/**
 * Handles media query changes and updates the modal UI live
 * @param {MediaQueryListEvent} event - The media query change event
 */
function handleMediaQueryChange(event) {

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
            contactModal.classList.add("edit-contact-modal");
            contactModal.classList.add("edit-dialog-swipe-in");
            modalHeader.classList.remove("add-modal-header")
            modalHeader.classList.add("edit-modal-header")
        } else {
            contactModal.classList.add("contact-modal");
            contactModal.classList.add("dialog-swipe-in");
        }

    } else {
        setupAddContactModal();
        contactModal.classList.add("contact-modal");
        contactModal.classList.add("dialog-swipe-in");
        modalHeader.classList.remove("edit-modal-header");
        modalHeader.classList.add("add-modal-header")
    }
    contactModal.showModal();

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

/**
 * Closes the contact modal
 */
function closeContactModal() {
    const modalAvatar = document.getElementById("modalAvatar")

    contactModal.classList.contains("edit-contact-modal") ?
        superToggle(contactModal, "edit-dialog-swipe-in", "edit-dialog-swipe-out") :
        superToggle(contactModal, "dialog-swipe-in", "dialog-swipe-out")

    setTimeout(() => {
        contactModal.close();
        contactModal.removeAttribute("class");
        modalAvatar.classList.remove("avatar-default");
        modalAvatar.removeAttribute("style");
        modalHeader.classList.remove("edit-modal-header");
        modalHeader.classList.remove("add-modal-header");
    }, 300);

    isEditMode = false;
}

/**
 * Utility "function" for multi-toggling of two classes
 * @param {HTMLElement} element - The element to toggle
 * @param {String} class0 - First class for toggling
 * @param {String} class1 - Second class for toggling
 */
const superToggle = function (element, class0, class1) {
    element.classList.remove(class0);
    element.classList.add(class1);
}

/**
 * Deletes a contact and closes it
 */
function deleteContactFromModal() {
    closeContactModal();
    deleteContact();
}

/**
 * Gets form data from the contact modal
 * @return {Object} Object containing name, email, and phone
 */
function getFormData() {
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    return {name, email, phone};
}

/**
 * Saves the contact data (both create and edit)
 * @param {Event} event - Form submit event
 * @return {void}
 */
async function saveContact(event) {
    const addedContactRef = document.getElementById("contactAdded");
    event.preventDefault();

    const formData = getFormData();

    if (!validateContactForm(formData)) {
        return;
    }

    const {name, email, phone} = formData;

    if (isEditMode) {
        await updateContact(currentContactId, name, email, phone, getInitialsFromName(name));
    } else {
        const newContactId = generateContactId();
        currentContactId = newContactId;
        await createContact(newContactId, name, email, phone, getRandomColor(), getInitialsFromName(name), false);
        addedContactRef.classList.add("forward-animation-contact");
        setTimeout(() => {
            addedContactRef.classList.remove("forward-animation-contact");
            addedContactRef.classList.add("backward-animation-contact");
            setTimeout(() => {
                addedContactRef.classList.remove("backward-animation-contact");
            }, 500);
        }, 1000);
    }

    if (document.getElementById("contactDetailView").classList.contains("active")) {
        showContactDetail(currentContactId);
    }

    closeContactModal();
}

/**
 * Sets up click listeners for various buttons and links
 * @returns {void}
 */
function setupClickListeners() {
    const fabButton = document.getElementById("fabButton");
    if (fabButton) {
        fabButton.addEventListener("click", handleFabClick);
    }
    const editContactLink = document.getElementById("editContactLink");
    if (editContactLink) {
        editContactLink.addEventListener("click", (event) => {
            event.preventDefault();
            editContact();
        });
    }
    const deleteContactLink = document.getElementById("deleteContactLink");
    if (deleteContactLink) {
        deleteContactLink.addEventListener("click", (event) => {
            event.preventDefault();
            deleteContact();
        });
    }

    const editContactDesktop = document.getElementById("editContactDesktop");
    if (editContactDesktop) {
        editContactDesktop.addEventListener("click", editContact);
    }
    const deleteContactDesktop = document.getElementById("deleteContactDesktop");
    if (deleteContactDesktop) {
        deleteContactDesktop.addEventListener("click", deleteContact);
    }

    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", hideContactDetail);
    }
    const modalBackdrop = document.getElementById("modalBackdrop");
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", closeContactModal);
    }
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeContactModal);
    }
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", closeContactModal);
    }
    const deleteButton = document.getElementById("deleteButton");
    if (deleteButton) {
        deleteButton.addEventListener("click", deleteContactFromModal);
    }
}

/**
 * Initializes the contacts module by loading contacts from the database,
 * setting up click outside listeners, add contact button event listener,
 * and various click listeners. Also registers a media query change listener
 * for responsive UI updates that handles modal closing and contact detail view updates.
 * Finally, sets up the contact form submit handler.
 * @returns {void}
 */
function init() {
    loadContactsFromRTDB();
    setupClickOutsideListener();
    setupAddContactBtnEventListener();
    setupClickListeners();

    desktopMediaQuery.addEventListener("change", (event) => {
        handleMediaQueryChange(event);

        if (currentContactId && contactModal.open) {
            closeContactModal()
        }
        showContactDetail(currentContactId);

    });

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", saveContact);
    }
}

document.addEventListener("DOMContentLoaded", init);