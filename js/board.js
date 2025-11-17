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

function getTemplateMarkedUser(memberIndex, memberInitials) {
  return `<div class="marked-user marked-user-${memberIndex}" style="background-color: var(--color-variant${memberIndex});">${memberInitials}</div>`
}

function getTemplateRemainingMembers(memberIndex, remainingMembers) {
  return `<div class="marked-user marked-user-${memberIndex}" style="background-color: var(--color-variant-over);">+${remainingMembers}</div>`
}

function updateHTML() {
  /**
   * To do Tasks
   */
  let toDo = tasks.filter((t) => t["category"] == "to-do");
  const toDoRef = document.getElementById("to-do");

  toDoRef.innerHTML = "";

  if (toDo.length === 0) {
    toDoRef.innerHTML = getNoTaskTemplate("to do");
  } else {
    for (let index = 0; index < toDo.length; index++) {
      const element = toDo[index];
      const eleIndex = index + 1;
      const eleInitials = element["member"][0].charAt(0).toUpperCase() + element["member"][0].charAt(element["member"][0].indexOf(" ") + 1).toUpperCase();
      toDoRef.innerHTML += getTemplateTaskCard(element, eleIndex, eleInitials);
      initMarkedUsers(element);
    }
  }

  /**
   * In Progress Tasks
   */
  let inProgress = tasks.filter((t) => t["category"] == "in-progress");
  const inProgressRef = document.getElementById("in-progress");

  inProgressRef.innerHTML = "";

  if (inProgress.length === 0) {
    inProgressRef.innerHTML = getNoTaskTemplate("in progress");
  } else {
    for (let index = 0; index < inProgress.length; index++) {
      const element = inProgress[index];
      const eleIndex = index + 1;
      const eleInitials = element["member"][0].charAt(0).toUpperCase() + element["member"][0].charAt(element["member"][0].indexOf(" ") + 1).toUpperCase();
      inProgressRef.innerHTML += getTemplateTaskCard(element, eleIndex, eleInitials);
      initMarkedUsers(element);
    }
  }

  /**
   * Await Feedback Tasks
   */
  let awaitFeedback = tasks.filter((t) => t["category"] == "await-feedback");
  const awaitFeedbackRef = document.getElementById("await-feedback");

  awaitFeedbackRef.innerHTML = "";

  if (awaitFeedback.length === 0) {
    awaitFeedbackRef.innerHTML = getNoTaskTemplate("awaiting feedback");
  } else {
    for (let index = 0; index < awaitFeedback.length; index++) {
      const element = awaitFeedback[index];
      const eleIndex = index + 1;
      const eleInitials = element["member"][0].charAt(0).toUpperCase() + element["member"][0].charAt(element["member"][0].indexOf(" ") + 1).toUpperCase();
      awaitFeedbackRef.innerHTML += getTemplateTaskCard(element, eleIndex, eleInitials);
      initMarkedUsers(element);
    }
  }

  /**
   * Done Tasks
   */
  let done = tasks.filter((t) => t["category"] == "done");
  const doneRef = document.getElementById("done");

  doneRef.innerHTML = "";

  if (done.length === 0) {
    doneRef.innerHTML = getNoTaskTemplate("done");
  } else {
    for (let index = 0; index < done.length; index++) {
      const element = done[index];
      const eleIndex = index + 1;
      const eleInitials = element["member"][0].charAt(0).toUpperCase() + element["member"][0].charAt(element["member"][0].indexOf(" ") + 1).toUpperCase();
      doneRef.innerHTML += getTemplateTaskCard(element, eleIndex, eleInitials);
      initMarkedUsers(element);
    }
  }
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

function getTemplateTaskCard(element) {
  return `<div class="task-card" id="${element["id"]}" draggable="true" onclick="openDialog('${element["id"]}')" ondragstart="startDragging('${element["id"]}')">
                            <div class="card-headline">
                                <div class="card-label card-bg-${element["task"].split(" ")[0].toLowerCase()}-${element["task"].split(" ")[1].toLowerCase()}">${element["task"]}</div>
                                <div class="card-swap-icon"></div>
                            </div>
                            <div class="card-task-title">${element["title"]}</div>
                            <div class="card-task-text">${element["text"]}</div>
                            <div class="card-progress-container">
                                <div class="card-progress-bar">
                                    <div class="card-sub-progress-bar" style="width: ${((element["subtasks_done"].length) / (element["subtasks_done"].length + element["subtasks"].length)) * 100}%;"></div>
                                </div>
                                <div id="tasks-done">${element["subtasks_done"].length}/${(element["subtasks"].length + element["subtasks_done"].length)} Subtasks</div>
                            </div>
                            <div class="user-prio-container">
                                <div class="marked-user-container" id="marked-user-container-${element["id"]}">
                                </div>
                                <div class="card-prio-icon"
                                    style="background: url(./assets/priority_icons/prio_${element["priority"]}_colored.svg) center center no-repeat;">
                                </div>
                            </div>
                        </div>`;
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
  iniSubtasks(element["subtasks"]);
  dialogRef.showModal();
}

/**
 * Close Dialog
 */
function closeDialog() {
  dialogRef.classList.remove("dialog-swipe-in");
  dialogRef.close();
}

function getTemplateDialog(element) {
  return `<div class="dialog-content">
        <div class="d-card-header">
          <div class="card-label card-bg-${element["task"].split(" ")[0].toLowerCase()}-${element["task"].split(" ")[1].toLowerCase()}">${element["task"]}</div>
          <div class="close-dialog" onclick="closeDialog()"></div>
        </div>
        <section>
          <div class="d-card-headline">
            <h2>${element["title"]}</h2>
          </div>
          <p>${element["text"]}</p>
          <div class="d-due-date-prio">
            <p><strong>Due date:</strong></p>
            <p>10/05/2025</p>
          </div>
          <div class="d-due-date-prio">
            <p><strong>Priority:</strong></p>
            <p class="p-prio">${element["priority"].charAt(0).toUpperCase() + element["priority"].slice(1)}</p>
            <img src="./assets/priority_icons/prio_${element["priority"]}_colored.svg" alt="prio ${element["priority"]}" />
          </div>
          <div class="d-assigned-to">
            <p><strong>Assigned to:</strong></p>
            <div class="d-assigned-members" id="d-assigned-members" onload="initMembers()">
            </div>
          </div>
          <div class="d-subtasks">
            <p><strong>Subtasks:</strong></p>
            <div class="d-subtasks-check">
          </div>
        </section>
        <div class="d-card-footer">
          <div class="d-card-footer-d">Delete</div>
          <div class="d-card-footer-e">Edit</div>
        </div>
      </div>`;
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

function getTemplateMember(member, memberInitials, memberIndex) {
  return `<div class="d-assigned-member-cards">
                <div class="d-assigned-member-icon" style="background-color: var(--color-variant${memberIndex})">
                  ${memberInitials}
                </div>
                <p>${member}</p>
              </div>`;
}

function iniSubtasks(subtasks) {
  let subtasksContainer = document.querySelector(".d-subtasks-check");
  subtasksContainer.innerHTML = "";
  for (let index = 0; index < subtasks.length; index++) {
    const subtask = subtasks[index];
    const subtaskId = index + 1;
    subtasksContainer.innerHTML += getTemplateSubtask(subtask, subtaskId);
  }
}

function getTemplateSubtask(subtask, subtaskId) {
  return `<div class="d-subtask">
                <input type="checkbox" id="d-subtask-${subtaskId}" />
                <label for="d-subtask-${subtaskId}">${subtask}</label>
              </div>`;
}
