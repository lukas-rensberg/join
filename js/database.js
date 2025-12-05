import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_jMGVxtdphe5xhWwkHQFh7T7a5wQLA0Y",
  authDomain: "join-826aa.firebaseapp.com",
  databaseURL:
    "https://join-826aa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-826aa",
  storageBucket: "join-826aa.firebasestorage.app",
  messagingSenderId: "78529793935",
  appId: "1:78529793935:web:447cc3226ea44f8d2bc5fa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Avatar colors for contacts
const AVATAR_COLORS = ["#ff7a00", "#ff5eb3", "#4589ff", "#ffc701", "#1fd7c1", "#9327ff", "#00bee8", "#ff4646"];

/**
 * Get random avatar color from predefined palette
 */
function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Generate initials from name
 */
function getInitials(name) {
  const nameParts = name.trim().split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
  return initials || "U";
}

/**
 * Generate random phone number
 */
function generatePhoneNumber() {
  const random = Math.floor(Math.random() * 1000000000);
  return `+49 ${String(random).padStart(9, '0').match(/.{1,3}/g).join(' ')}`;
}

/**
 * Ensure authenticated user exists as contact in RTDB
 */
export async function ensureUserAsContact(user) {
  if (!user || user.isAnonymous) return;

  try {
    const contactRef = ref(database, `contacts/${user.uid}`);
    const snapshot = await get(contactRef);

    if (!snapshot.exists()) {
      // User doesn't exist as contact, create one
      await set(contactRef, {
        id: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        phone: generatePhoneNumber(),
        avatarColor: getRandomColor(),
        initials: getInitials(user.displayName || user.email.split("@")[0]),
        isAuthUser: true,
      });
      console.log("User added to contacts:", user.email);
    }
  } catch (error) {
    console.error("Error ensuring user as contact:", error);
  }
}

/**
 * Create contact in RTDB for a user
 */
export async function createContactForUser(uid, username, email) {
  try {
    await set(ref(database, `contacts/${uid}`), {
      id: uid,
      name: username,
      email: email,
      phone: generatePhoneNumber(),
      avatarColor: getRandomColor(),
      initials: getInitials(username),
      isAuthUser: true,
    });
    console.log("Contact created in RTDB for new user");
  } catch (error) {
    console.error("Error creating contact in RTDB:", error);
  }
}

/**
 * Create a new task in RTDB
 * @param {Object} taskData - Task data object
 * @returns {Promise<string>} - The ID of the created task
 */
export async function createTask(taskData) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to create tasks");
    }

    const tasksRef = ref(database, 'tasks');
    const newTaskRef = push(tasksRef);

    const now = Date.now();

    const task = {
      id: newTaskRef.key,
      title: taskData.title,
      text: taskData.text || "",
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      task: taskData.task, // Category name (e.g., "Technical Task" or "User Story")
      category: taskData.category || "to-do", // Status: "to-do", "in-progress", "awaiting-feedback", "done"
      member: taskData.member || [],
      subtasks: taskData.subtasks || [],
      subtasks_done: [],
      createdAt: now,
      updatedAt: now
    };

    await set(newTaskRef, task);
    console.log("Task created successfully:", task.id);
    return task.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export { auth, database };

