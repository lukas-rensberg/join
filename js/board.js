import { getTemplateDialog } from "./template.js";

let dialogRef = document.querySelector("dialog");

let tasks = [
  {
    id: "to-do-1",
    task: "User Story",
    title: "Kochwelt Page & Recipe Recommender",
    text: "Build start page with recipe recommandation...",
    subtasks: ["Beta Test", "Double Check", "Design Mockup", "Gather Content"],
    subtasks_done: ["Start Layout", "Implement Recipe Recommendation"],
    member: ["Anton Chart", "Edkar Massulo", "Manuel Mann", "Wolfgang Wolf", "Susi Super", "Lena Loder", "Peter Parker"],
    priority: "medium",
    category: "to-do",
  },
  {
    id: "to-do-2",
    task: "Technical Task",
    title: "HTML Base Template Creation",
    text: "Create reusable HTML base templates...",
    subtasks: ["Beta Test", "Double Check", "Extra Subtask"],
    subtasks_done: ["Another Subtask", "More Subtasks"],
    member: ["Anton Chart", "Edkar Massulo", "Manuel Mann", "Wolfgang Wolf", "Susi Super", "Lena Loder", "Peter Parker", "Bruce Banner", "Tony Stark"],
    priority: "urgent",
    category: "to-do",
  },
  {
    id: "await-feedback-1",
    task: "User Story",
    title: "HTML Base Template Creation",
    text: "Create reusable HTML base templates...",
    subtasks: ["Beta Test"],
    subtasks_done: ["Double Check"],
    member: ["Anton Chart", "Edkar Massulo", "Manuel Mann", "Wolfgang Wolf", "Susi Super", "Lena Loder"],
    priority: "urgent",
    category: "await-feedback",
  },
  {
    id: "in-progress-1",
    task: "Technical Task",
    title: "HTML Base Template Creation",
    text: "Create reusable HTML base templates...",
    subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
    subtasks_done: [],
    member: ["Anton Chart", "Edkar Massulo", "Manuel Mann", "Wolfgang Wolf", "Susi Super", "Lena Loder", "Peter Parker", "Bruce Banner", "Tony Stark"],
    priority: "urgent",
    category: "in-progress",
  },
  {
    id: "done-2",
    task: "User Story",
    title: "HTML Base Template Creation",
    text: "Create reusable HTML base templates...",
    subtasks: ["Beta Test", "Double Check", "Extra Subtask", "Another Subtask"],
    subtasks_done: ["Double Check"],
    member: ["Anton Chart", "Edkar Massulo", "Manuel Mann", "Wolfgang Wolf", "Susi Super", "Lena Loder", "Peter Parker", "Bruce Banner", "Tony Stark", "Clark Kent", "Diana Prince", "Barry Allen"],
    priority: "low",
    category: "done",
  },
];

let currentDraggedElement;

/**
 * Slide in menu
 */
function swapMenuSlideIn() {
  const swapMenu = document.getElementById("card-swap-menu");
  swapMenu.classList.remove("slide-out-swap-menu");
  swapMenu.classList.add("slide-in-swap-menu");

  /**
   * Listener for clicking outside menu to close menu
   */
  document.addEventListener("mousedown", handleOutsideClick);

  function handleOutsideClick(event) {
    if (!swapMenu.contains(event.target)) {
      slideOutMenu();
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }
}
/**
 * Slide out menu
 */
function slideOutMenu() {
  const swapMenu = document.getElementById("card-swap-menu");
  swapMenu.classList.remove("slide-in-swap-menu");
  swapMenu.classList.add("slide-out-swap-menu");
}



/**
 * Start of Dragging and updating HTML
 * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
 */

function initMarkedUsers(element) {
  let markedUserContainer = document.getElementById(`marked-user-container-${element["id"]}`);
  for (let index = 0; index < element["member"].length; index++) {
    const memberIndex = index + 1;
    if (index == 3) {
      const remainingMembers = element["member"].length - 3;
      markedUserContainer.innerHTML += getTemplateRemainingMembers(memberIndex, remainingMembers);
      break;
    } else {
      const member = element["member"][index];
      const firstLetter = member.charAt(0).toUpperCase();
      const secondLetter = member.charAt(member.indexOf(" ") + 1).toUpperCase();
      const memberInitials = firstLetter + secondLetter;
      markedUserContainer.innerHTML += getTemplateMarkedUser(memberIndex, memberInitials);
    }
  }
}

/**
 * Renders tasks for a specific category
 * @param {string} category Task category
 * @param {string} displayName Display name for empty state
 */
function renderTasksByCategory(category, displayName) {
  const filteredTasks = tasks.filter((t) => t["category"] === category);
  const containerRef = document.getElementById(category);
  containerRef.innerHTML = "";

  if (filteredTasks.length === 0) {
    containerRef.innerHTML = getNoTaskTemplate(displayName);
    return;
  }

  filteredTasks.forEach((task) => {
    containerRef.innerHTML += getTemplateTaskCard(task);
    initMarkedUsers(task);
  });
}

/**
 * Updates all task columns in the board
 */
function updateHTML() {
  renderTasksByCategory("to-do", "to do");
  renderTasksByCategory("in-progress", "in progress");
  renderTasksByCategory("await-feedback", "awaiting feedback");
  renderTasksByCategory("done", "done");
}

function startDragging(id) {
  currentDraggedElement = id;
  document.getElementById(currentDraggedElement).classList.add("is-dragging");
}

function allowDrop(event) {
  event.preventDefault();
}

function moveTo(category) {
  tasks.forEach((task) => {
    if (task["id"] == currentDraggedElement) {
      task["category"] = category;
    }
  });
  document.getElementById(currentDraggedElement).classList.remove("is-dragging");
  bgContainerRemove(category);
  updateHTML();
}

function bgContainer(id) {
  document.getElementById(id).classList.add("task-card-container-dragover");
}

function bgContainerRemove(id) {
  hideDashedBox(id);
  document.getElementById(id).classList.remove("task-card-container-dragover");
}

function getNoTaskTemplate(section) {
  return `<div class="no-tasks">No tasks ${section}</div>`;
}

function showDashedBoxOnce(section) {
  // Remove any 'no-tasks' element if present in the section container
  const container = document.getElementById(section);
  const noTasksElem = container.querySelector(".no-tasks");
  if (noTasksElem) {
    noTasksElem.style.display = "none";
  }
  if (!container.querySelector(".empty-card")) {
    container.innerHTML += generateEmptyCard();
  }
}

function hideDashedBox(section) {
  const container = document.getElementById(section);
  const noTasksElem = container.querySelector(".no-tasks");
  if (noTasksElem) {
    noTasksElem.style.display = "flex";
  }
  const emptyCard = container.querySelector(".empty-card");
  if (!emptyCard) return;
  emptyCard.parentNode.removeChild(emptyCard);
}

function generateEmptyCard() {
  return `<div class="empty-card"></div>`;
}

/**
 * Open dialog
 */
function openDialog(index) {
  let element = tasks.filter((t) => t["id"] == `${index}`)[0];
  dialogRef.classList.add("dialog-swipe-in");
  dialogRef.innerHTML = getTemplateDialog(element);
  initMembers(element["member"]);
  iniSubtasks(element["subtasks"], element["id"]);
  console.log(element["id"]);
  
  dialogRef.showModal();
}

/**
 * Close Dialog
 */
function closeDialog() {
  dialogRef.classList.remove("dialog-swipe-in");
  dialogRef.close();
}

function initMembers(members) {
  let membersContainer = document.getElementById("d-assigned-members");
  membersContainer.innerHTML = "";
  for (let index = 0; index < members.length; index++) {
    const member = members[index];
    const firstLetter = member.charAt(0).toUpperCase();
    const secondLetter = member.charAt(member.indexOf(" ") + 1).toUpperCase();
    const memberInitials = firstLetter + secondLetter;
    const memberIndex = index + 1;
    membersContainer.innerHTML += getTemplateMember(member, memberInitials, memberIndex);
  }
}

function iniSubtasks(subtasks, taskId) {
  let subtasksContainer = document.querySelector(".d-subtasks-check");
  subtasksContainer.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    const subtaskId = index + 1;
    subtasksContainer.innerHTML += getTemplateSubtask(subtask, taskId);
  }
}
