import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { showInlineError } from "./errorHandler.js";
import { Credentials } from "./credentials.js";

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

/**
 * Retrieves Firebase configuration from Credentials
 * @returns {{apiKey: string, authDomain: string, databaseURL: string, projectId: string, storageBucket: string, messagingSenderId: string, appId: string}}
 */
function getFirebaseConfig() {
    const cred = new Credentials();
    return {
        apiKey: cred.firebaseApiKey,
        authDomain: cred.firebaseAuthDomain,
        databaseURL: cred.firebaseDatabaseURL,
        projectId: cred.firebaseProjectId,
        storageBucket: cred.firebaseStorageBucket,
        messagingSenderId: cred.firebaseMessagingSenderId,
        appId: cred.firebaseAppId,
    };
}

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
export async function createContact(uid, username, email, phone, avatarColor, initials, isAuthUser = false) {
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
export async function updateContact(uid, name, email, phone, initials) {
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

/**
 * Updates an existing task in the RTDB
 * @param {String} taskId The ID of the task to update
 * @param {Object} updates The task fields to update
 * @return {Promise<void>} A promise that resolves when the task is updated
 */
export async function updateTask(taskId, updates) {
  try {
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    await update(ref(database, `tasks/${taskId}`), updateData);
  } catch (error) {
    showInlineError("Failed to update task. Please try again.");
    throw error;
  }
}

/**
 * Deletes a task from the RTDB
 * @param {String} taskId The ID of the task to delete
 * @return {Promise<void>} A promise that resolves when the task is deleted
 */
export async function deleteTask(taskId) {
  try {
    await remove(ref(database, `tasks/${taskId}`));
  } catch (error) {
    showInlineError("Failed to delete task. Please try again.");
    throw error;
  }
}

/**
 * Loads all tasks from the RTDB
 * @param {Function} callback Function to call when tasks are loaded or updated
 * @return {Function} Unsubscribe function to stop listening for changes
 */
export function loadTasks(callback) {
  const tasksRef = ref(database, 'tasks');
  return onValue(tasksRef, (snapshot) => {
    let tasks = [];
    if (snapshot.exists()) {
      const tasksData = snapshot.val();
      tasks = Object.values(tasksData);
    }
    callback(tasks);
  });
}

/**
 * Create a new task in RTDB
 * @param {Object} taskData - Task data object
 * @returns {Promise<string>} - The ID of the created task
 */
export async function createTask(taskData) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const tasksRef = ref(database, 'tasks');
    const newTaskRef = push(tasksRef);
    const now = Date.now();
    const task = getTaskObject(newTaskRef, taskData, now);
    await set(newTaskRef, task);
  } catch (_) {}
}

/**
 * Construct task object for RTDB
 * @param newTaskRef
 * @param taskData
 * @param now
 * @returns {{id: *, title: *, text, dueDate: string|*, priority: *, task: *|Promise<void>, category, member, subtasks, subtasks_done: *[], createdAt: *, updatedAt: *}}
 */
function getTaskObject(newTaskRef,taskData, now) {
    return {
        id: newTaskRef.key,
        title: taskData.title,
        text: taskData.text || "",
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        task: taskData.task,
        category: taskData.category || "to-do",
        member: taskData.member || [],
        subtasks: taskData.subtasks || [],
        subtasks_done: [],
        createdAt: now,
        updatedAt: now
    };
}

export { auth, database };
