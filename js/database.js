import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { showInlineError } from "./error-handler.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_jMGVxtdphe5xhWwkHQFh7T7a5wQLA0Y",
  authDomain: "join-826aa.firebaseapp.com",
  databaseURL: "https://join-826aa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-826aa",
  storageBucket: "join-826aa.firebasestorage.app",
  messagingSenderId: "78529793935",
  appId: "1:78529793935:web:447cc3226ea44f8d2bc5fa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

/**
 * Creates a new contact in the RTDB
 * @param {String} uid The user ID of the new contact
 * @param {String} username The name of the new contact
 * @param {String} email The email address of the new contact
 * @param {String} phone The phone number of the new contact
 * @param {String} avatarColor The avatar color of the new contact
 * @param {String} initials The initials of the new contact
 * @param {Boolean} [isAuthUser=false] Whether the contact is the authenticated user
 * @return {Promise<void>} A promise that resolves when the contact is created
 */
async function createContact(uid, username, email, phone, avatarColor, initials, isAuthUser = false) {
  try {
    await set(ref(database, `contacts/${uid}`), {
      id: uid,
      name: username,
      email: email,
      phone: phone,
      avatarColor: avatarColor,
      initials: initials,
      isAuthUser: isAuthUser,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    showInlineError("Failed to create contact. Please try again.");
  }
}

/**
 * Ensures the authenticated user exists as a contact in the RTDB.
 * @param {Object} user The authenticated user object from Firebase Auth.
 * @param {Function} generatePhoneNumber Function to generate a phone number for the contact.
 * @param {Function} getRandomColor Function to generate a random avatar color for the contact.
 * @param {Function} getInitials Function to generate initials from the user's name.
 * @returns {Promise<void>} A promise that resolves when the contact is ensured.
*/
export async function ensureUserAsContact(user, generatePhoneNumber, getRandomColor, getInitials) {
  if (!user || user.isAnonymous) return;

  const contactRef = ref(database, `contacts/${user.uid}`);
  const snapshot = await get(contactRef);

  if (!snapshot.exists()) {
    await createContact(
      user.uid,
      user.displayName || user.email.split("@")[0],
      user.email,
      generatePhoneNumber(),
      getRandomColor(),
      getInitials(user.displayName || user.email.split("@")[0]),
      true
    );
  }
}

/**
 * Updates an existing contact in the RTDB
 * @param {String} uid The user ID of the updated contact
 * @param {String} name The new name of the updated contact
 * @param {String} email The new email address of the updated contact
 * @param {String} phone The new phone number of the updated contact
 * @param {String} initials The new initials of the updated contact based on the new name
 * @return {Promise<void>} A promise that resolves when the contact is updated
 */
async function updateContact(uid, name, email, phone, initials) {
  try {
    await update(ref(database, `contacts/${uid}`), {
      name: name,
      email: email,
      phone: phone,
      initials: initials,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    showInlineError("Failed to update contact. Please try again.");
  }
}

export { auth, database, createContact, updateContact };