import { database } from "./auth.js";
import {
  ref,
  set,
  update,
  remove,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Global variables
let contacts = [];
let currentContactId = null;
let isEditMode = false;

// Avatar colors for contacts
const AVATAR_COLORS = ["#ff7a00", "#ff5eb3", "#4589ff", "#ffc701", "#1fd7c1", "#9327ff", "#00bee8", "#ff4646"];

/**
 * Generates a unique ID for contacts
 * @author Lukas Rensberg
 * @returns {string} Unique contact ID
 */
function generateContactId() {
  return (
    "contact_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

/**
 * Get random avatar color from predefined palette
 */
function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Generate initials from name
 */
function getInitialsFromName(name) {
  const nameParts = name.trim().split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
  return initials || "U";
}

/**
 * Get default contacts
 * @returns {Array} Array of default contact objects
 */
function getDefaultContacts() {
  return [
    {
      id: generateContactId(),
      name: "Anton Mayer",
      email: "anton.mayer@example.com",
      phone: "+49 1111 111 11 1",
      avatarColor: "#ff7a00",
      initials: "AM",
      isAuthUser: false,
    },
    {
      id: generateContactId(),
      name: "Anja Schulz",
      email: "anja.schulz@example.com",
      phone: "+49 1111 111 11 2",
      avatarColor: "#ff5eb3",
      initials: "AS",
      isAuthUser: false,
    },
    {
      id: generateContactId(),
      name: "Benedikt Ziegler",
      email: "benedikt.ziegler@example.com",
      phone: "+49 1111 111 11 3",
      avatarColor: "#4589ff",
      initials: "BZ",
      isAuthUser: false,
    },
    {
      id: generateContactId(),
      name: "David Eisenberg",
      email: "david.eisenberg@example.com",
      phone: "+49 1111 111 11 4",
      avatarColor: "#ff5eb3",
      initials: "DE",
      isAuthUser: false,
    },
    {
      id: generateContactId(),
      name: "Eva Fischer",
      email: "eva.fischer@example.com",
      phone: "+49 1111 111 11 5",
      avatarColor: "#ffc701",
      initials: "EF",
      isAuthUser: false,
    },
    {
      id: generateContactId(),
      name: "Emmanuel Mauer",
      email: "emmanuel.mauer@example.com",
      phone: "+49 1111 111 11 6",
      avatarColor: "#1fd7c1",
      initials: "EM",
      isAuthUser: false,
    },
  ];
}

/**
 * Migrate default contacts and localStorage contacts to RTDB
 */
async function migrateDefaultContacts() {
  try {
    // Check if localStorage has contacts
    const stored = localStorage.getItem("join_contacts");
    let contactsToMigrate = stored ? JSON.parse(stored) : getDefaultContacts();

    // Add isAuthUser flag if missing
    contactsToMigrate = contactsToMigrate.map(contact => ({
      ...contact,
      isAuthUser: contact.isAuthUser || false
    }));

    // Migrate each contact to RTDB
    for (const contact of contactsToMigrate) {
      await set(ref(database, `contacts/${contact.id}`), contact);
    }

    console.log("Contacts migrated to RTDB successfully");

    // Remove from localStorage after migration
    localStorage.removeItem("join_contacts");
  } catch (error) {
    console.error("Error migrating contacts to RTDB:", error);
  }
}

/**
 * Load contacts from RTDB
 */
async function loadContactsFromRTDB() {
  const contactsRef = ref(database, 'contacts');
  
  onValue(contactsRef, (snapshot) => {
    if (snapshot.exists()) {
      contacts = Object.values(snapshot.val());
      renderContactsList(contacts);
    } else {
      // No contacts in RTDB, migrate defaults
      migrateDefaultContacts();
    }
  });
}

/**
 * Renders the contacts list dynamically
 * @author Lukas Rensberg
 * @param {Array} contactsArray - Array of contact objects
 */
function renderContactsList(contactsArray) {
  const container = document.querySelector(".contacts-container");
  container.innerHTML = "";

  // Group contacts by first letter
  const groupedContacts = {};
  contactsArray.forEach((contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!groupedContacts[firstLetter]) {
      groupedContacts[firstLetter] = [];
    }
    groupedContacts[firstLetter].push(contact);
  });

  // Sort letters and render sections
  const sortedLetters = Object.keys(groupedContacts).sort();
  sortedLetters.forEach((letter) => {
    const section = document.createElement("div");
    section.className = "contact-section";

    section.innerHTML = `
            <h2 class="section-header">${letter}</h2>
            <div class="section-separator"></div>
        `;

    // Sort contacts in this section by name
    groupedContacts[letter].sort((a, b) => a.name.localeCompare(b.name));

    groupedContacts[letter].forEach((contact) => {
      const contactItem = document.createElement("div");
      contactItem.className = "contact-item";
      contactItem.onclick = () => showContactDetail(contact.id);

      contactItem.innerHTML = `
                <div class="contact-avatar" style="background-color: ${contact.avatarColor};">${contact.initials}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-email">${contact.email}</div>
                </div>
            `;

      section.appendChild(contactItem);
    });

    container.appendChild(section);
  });
}

/**
 * Initializes contacts on page load
 * @author Lukas Rensberg
 */
function initializeContacts() {
  loadContactsFromRTDB();
}

/**
 * Handles FAB click - either adds contact or shows menu depending on view
 * @author Lukas Rensberg
 */
function handleFabClick() {
  const detailView = document.getElementById("contactDetailView");
  if (detailView.classList.contains("active")) {
    // In detail view - toggle menu
    toggleFabMenu();
  } else {
    // In contact list - add contact
    addContact();
  }
}

/**
 * Handles adding a new contact - opens the modal in create mode
 * @author Lukas Rensberg
 */
function addContact() {
  openContactModal(false);
}

/**
 * Toggles the FAB menu visibility
 * @author Lukas Rensberg
 */
function toggleFabMenu() {
  const fabMenu = document.getElementById("fabMenu");
  if (fabMenu) {
    fabMenu.classList.toggle("active");
  }
}

/**
 * Closes the FAB menu
 * @author Lukas Rensberg
 */
function closeFabMenu() {
  const fabMenu = document.getElementById("fabMenu");
  if (fabMenu) {
    fabMenu.classList.remove("active");
  }
}

/**
 * Setup click outside listener for FAB menu
 */
function setupClickOutsideListener() {
  document.addEventListener("click", function (event) {
    const fabButton = document.getElementById("fabButton");
    const fabMenu = document.getElementById("fabMenu");

    // Check if click is outside both FAB button and menu
    if (fabButton && fabMenu && !fabButton.contains(event.target) && !fabMenu.contains(event.target)) {
      closeFabMenu();
    }
  });
}

/**
 * Shows the contact detail view with the provided contact ID
 * @author Lukas Rensberg
 * @param {string} contactId - Contact's unique ID
 */
function showContactDetail(contactId) {
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return;

  currentContactId = contactId;

  // Hide the contact list
  document.querySelector(".contacts-container").style.display = "none";

  // Populate the detail view
  document.getElementById("detailName").textContent = contact.name;
  document.getElementById("detailEmail").textContent = contact.email;
  document.getElementById("detailPhone").textContent = contact.phone;

  // Set up the avatar
  const avatar = document.getElementById("detailAvatar");
  avatar.textContent = contact.initials;
  avatar.style.backgroundColor = contact.avatarColor;

  // Change FAB icon to three dots
  const fabIcon = document.getElementById("fabIcon");
  fabIcon.src = "./assets/icons/more-vertical.svg";
  fabIcon.alt = "Menu";

  // Show the detail view
  document.getElementById("contactDetailView").classList.add("active");
}

/**
 * Hides the contact detail view and shows the contact list
 * @author Lukas Rensberg
 */
function hideContactDetail() {
  // Hide the detail view
  document.getElementById("contactDetailView").classList.remove("active");

  // Change FAB icon back to add contact
  const fabIcon = document.getElementById("fabIcon");
  fabIcon.src = "./assets/icons/person_add.svg";
  fabIcon.alt = "Add Contact";

  // Hide FAB menu if open
  document.getElementById("fabMenu").classList.remove("active");

  // Show the contact list
  document.querySelector(".contacts-container").style.display = "block";
}

/**
 * Handles editing a contact - opens the modal in edit mode
 * @author Lukas Rensberg
 */
function editContact() {
  if (!currentContactId) return;
  openContactModal(true);
}

/**
 * Opens the contact modal in either create or edit mode
 * @author Lukas Rensberg
 * @param {boolean} editMode - Whether to open in edit mode (true) or create mode (false)
 */
function openContactModal(editMode) {
  isEditMode = editMode;

  if (editMode) {
    // Edit mode - pre-populate with current contact data
    if (!currentContactId) return;

    const contact = contacts.find((c) => c.id === currentContactId);
    if (!contact) return;

    // Set modal title and button text
    document.getElementById("modalTitle").textContent = "Edit contact";
    document.getElementById("saveButtonText").textContent = "Save";
    document.getElementById("deleteButton").style.display = "block";

    // Pre-populate form with current contact data
    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactEmail").value = contact.email;
    document.getElementById("contactPhone").value = contact.phone;

    // Set modal avatar
    const modalAvatar = document.getElementById("modalAvatar");
    modalAvatar.textContent = contact.initials;
    modalAvatar.style.backgroundColor = contact.avatarColor;
  } else {
    // Create mode - clear form
    document.getElementById("modalTitle").textContent = "Add contact";
    document.getElementById("saveButtonText").textContent = "Create contact";
    document.getElementById("deleteButton").style.display = "none";

    // Clear form
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";

    // Set default avatar
    const modalAvatar = document.getElementById("modalAvatar");
    modalAvatar.textContent = "?";
    modalAvatar.style.backgroundColor = "#4589ff";
  }

  // Show modal
  document.getElementById("contactModal").classList.add("active");
  closeFabMenu();
}

/**
 * Handles deleting a contact - deletes immediately without confirmation
 * @author Lukas Rensberg
 */
async function deleteContact() {
  if (!currentContactId) return;

  const contact = contacts.find((c) => c.id === currentContactId);
  if (!contact) return;

  try {
    // Remove contact from RTDB
    await remove(ref(database, `contacts/${currentContactId}`));
    console.log("Contact deleted from RTDB");

    // Hide detail view and close FAB menu
    hideContactDetail();
    closeFabMenu();

    // TODO: Remove contact from all assigned tasks when task functionality is implemented
  } catch (error) {
    console.error("Error deleting contact from RTDB:", error);
    alert("Error deleting contact. Please try again.");
  }
}

/**
 * Closes the contact modal
 * @author Lukas Rensberg
 */
function closeContactModal() {
  document.getElementById("contactModal").classList.remove("active");
}

/**
 * Handles deleting a contact from the modal - deletes immediately
 * @author Lukas Rensberg
 */
function deleteContactFromModal() {
  closeContactModal();
  deleteContact();
}

/**
 * Saves the contact data (both create and edit)
 * @author Lukas Rensberg
 * @param {Event} event - Form submit event
 */
async function saveContact(event) {
  event.preventDefault();

  // Get form data
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  // Generate initials from name
  const initials = getInitialsFromName(name);

  try {
    if (isEditMode) {
      // Edit mode - update existing contact
      if (!currentContactId) return;

      const contact = contacts.find((c) => c.id === currentContactId);
      if (!contact) return;

      // Update contact in RTDB
      await update(ref(database, `contacts/${currentContactId}`), {
        name: name,
        email: email,
        phone: phone,
        initials: initials,
      });

      console.log("Contact updated in RTDB");

      // Update detail view if it's showing the same contact
      if (
        document.getElementById("contactDetailView").classList.contains("active")
      ) {
        showContactDetail(currentContactId);
      }
    } else {
      // Create mode - add new contact
      const newContactId = generateContactId();
      const newContact = {
        id: newContactId,
        name: name,
        email: email,
        phone: phone,
        avatarColor: getRandomColor(),
        initials: initials,
        isAuthUser: false,
      };

      // Add to RTDB
      await set(ref(database, `contacts/${newContactId}`), newContact);
      console.log("New contact added to RTDB");
    }

    // Close modal
    closeContactModal();
  } catch (error) {
    console.error("Error saving contact to RTDB:", error);
    alert("Error saving contact. Please try again.");
  }
}

/**
 * Setup event listeners for buttons and links
 */
function setupEventListeners() {
  // FAB button
  const fabButton = document.getElementById("fabButton");
  if (fabButton) {
    fabButton.addEventListener("click", handleFabClick);
  }

  // Edit and delete links in FAB menu
  const editLink = document.getElementById("editContactLink");
  if (editLink) {
    editLink.addEventListener("click", (e) => {
      e.preventDefault();
      editContact();
    });
  }

  const deleteLink = document.getElementById("deleteContactLink");
  if (deleteLink) {
    deleteLink.addEventListener("click", (e) => {
      e.preventDefault();
      deleteContact();
    });
  }

  // Back button in detail view
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", hideContactDetail);
  }

  // Modal close button
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeContactModal);
  }

  // Modal backdrop
  const modalBackdrop = document.getElementById("modalBackdrop");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeContactModal);
  }

  // Delete button in modal
  const deleteButton = document.getElementById("deleteButton");
  if (deleteButton) {
    deleteButton.addEventListener("click", deleteContactFromModal);
  }

  // Form submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", saveContact);
  }
}

// Initialize contacts and event listeners when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeContacts();
  setupEventListeners();
  setupClickOutsideListener();
});
