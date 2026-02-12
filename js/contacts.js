/**
 * @fileoverview Handles contact management including adding, editing, deleting, and displaying contacts.
 */

import {createContact, database, updateContact} from "./database.js";
import {getRandomColor} from "../utils/contact.js";
import {onValue, ref} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import {generateContactItemTemplate, generateSectionTemplate} from "./template.js";
import {validateContactForm} from "./contactFormValidation.js";
import {
    contactModal,
    deleteContact,
    desktopMediaQuery,
    editContact,
    handleFabClick,
    handleMediaQueryChange,
    hideContactDetail,
    modalHeader,
    setContacts,
    setupAddContactBtnEventListener,
    setupClickOutsideListener,
    showContactDetail,
    setEditMode,
    getEditMode,
    setCurrentContactId,
    getCurrentContactId,
    getContacts
} from "../utils/showContactDetail.js";

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
    let contactsRef = ref(database, 'contacts');

    onValue(contactsRef, (snapshot) => {
        if (snapshot.exists()) {
            setContacts(Object.values(snapshot.val()));
            renderContactsList(getContacts());
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

    setEditMode(false);
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

    if (!validateContactForm(formData)) return;

    const {name, email, phone} = formData;

    if (getEditMode()) await updateContact(getCurrentContactId(), name, email, phone, getInitialsFromName(name));
    else await createNewContact(addedContactRef, name, email, phone);

    if (document.getElementById("contactDetailView").classList.contains("active")) showContactDetail(getCurrentContactId());

    closeContactModal();
}

async function createNewContact(container, name, email, phone) {
    const newContactId = generateContactId();
    setCurrentContactId(newContactId);
    await createContact(newContactId, name, email, phone, getRandomColor(), getInitialsFromName(name), false);
    container.classList.add("forward-animation-contact");
    setTimeout(() => {
        container.classList.remove("forward-animation-contact");
        container.classList.add("backward-animation-contact");
        setTimeout(() => {
            container.classList.remove("backward-animation-contact");
        }, 500);
    }, 1000);
}

/**
 * Sets up click listeners for various buttons and links
 * @returns {void}
 */
function setupClickListeners() {
    setupFabButton()
    setupContactLinks()
    setupDesktopActions()
    setupContactModalCloseListeners()

    const backButton = document.getElementById("backButton");
    if (backButton) backButton.addEventListener("click", hideContactDetail);

    const deleteButton = document.getElementById("deleteButton");
    if (deleteButton) deleteButton.addEventListener("click", deleteContactFromModal);
}

function setupFabButton() {
    const fabButton = document.getElementById("fabButton");
    if (fabButton) fabButton.addEventListener("click", handleFabClick);
}

function setupContactLinks() {
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
}

function setupDesktopActions() {
    const editContactDesktop = document.getElementById("editContactDesktop");
    if (editContactDesktop) editContactDesktop.addEventListener("click", editContact);
    const deleteContactDesktop = document.getElementById("deleteContactDesktop");
    if (deleteContactDesktop) deleteContactDesktop.addEventListener("click", deleteContact);
}

function setupContactModalCloseListeners() {
    const modalBackdrop = document.getElementById("modalBackdrop");
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeContactModal);
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeContactModal);
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) cancelButton.addEventListener("click", closeContactModal);
}

function init() {
    loadContactsFromRTDB();
    setupClickOutsideListener();
    setupAddContactBtnEventListener();
    setupClickListeners();

    desktopMediaQuery.addEventListener("change", (event) => {
        handleMediaQueryChange(event);
        if (getCurrentContactId() && contactModal.open) closeContactModal()
        showContactDetail(getCurrentContactId());
    });

    const contactForm = document.getElementById("contactForm");
    if (contactForm) contactForm.addEventListener("submit", saveContact);
}

document.addEventListener("DOMContentLoaded", init);