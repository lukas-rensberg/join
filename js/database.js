import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

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
 * @param {String} email The e-mail-address of the new contact
 * @param {String} phone The phone number of the new contact
 * @param {String} avatarColor The avatar color of the new contact
 * @param {String} initials The initials of the new contact
 * @param {Boolean} isAuthUser @default false Whether the contact is the authenticated user
 * @return {Promise<void>} A promise that resolves when the contact is created
 */
async function createContact(uid, username, email, phone, avatarColor, initials, isAuthUser = false) {
  await set(ref(database, `contacts/${uid}`), {
    id: uid,
    name: username,
    email: email,
    phone: phone,
    avatarColor: avatarColor,
    initials: initials,
    isAuthUser: isAuthUser,
  });
}

/**
 * Ensure authenticated user exists as contact in RTDB
 */
export async function ensureUserAsContact(user, generatePhoneNumber, getRandomColor, getInitials) {
  if (!user || user.isAnonymous) return;

  const contactRef = ref(database, `contacts/${user.uid}`);
  const snapshot = await get(contactRef);

  if (!snapshot.exists()) {
    await createContact(user.uid, "Example User", user.email, generatePhoneNumber(), getRandomColor(), getInitials("Example User"), true);
  }
}

/**
 * Updates an existing contact in the RTDB
 * @param {String} name The new name of the updated contact
 * @param {String} email The new mail address of the updated contact
 * @param {String} phone The new phone number of the updated contact
 * @param {String} initials The new initials of the updated contact based on the new name
 * @return {Promise<void>} A promise that resolves when the contact is updated
 */
async function updateContact(uid, name, email, phone, initials) {
  await update(ref(database, `contacts/${uid}`), {
    name: name,
    email: email,
    phone: phone,
    initials: initials,
  });
}

export { auth, database, createContact, updateContact };