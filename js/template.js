/**
 * Create error message element for authentication errors
 * @param {string} message - The error message to display
 * @returns {HTMLElement} The error message div element
 */
export function createAuthErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "auth-error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff0000;
    font-size: 0.7rem;
    margin-top: 0.5rem;
    width: 90%;
  `;
  return errorDiv;
};

/**
 * Generates an HTML template for a section header with the given letter.
 * @param {string} letter - The letter to display as the section header.
 * @returns {string} The HTML string for the section header and separator.
 */
export function generateSectionTemplate(letter) {
  return `
            <h2 class="section-header">${letter}</h2>
            <div class="section-separator"></div>
        `
};

/**
 * Generates an HTML template string for a contact item.
 * @param {Object} contact - The contact object containing details to display.
 * @param {string} contact.avatarColor - The background color for the contact's avatar.
 * @param {string} contact.initials - The initials to display in the avatar.
 * @param {string} contact.name - The contact's full name.
 * @param {string} contact.email - The contact's email address.
 * @returns {string} The HTML string representing the contact item.
 */
export function generateContactItemTemplate(contact) {
  return `
                <div class="contact-avatar" style="background-color: ${contact.avatarColor};">${contact.initials}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-email">${contact.email}</div>
                </div>
            `;
}

export function getTemplateDialog(element) {
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

export function getTemplateTaskCard(element) {
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

export function getTemplateMember(member, memberInitials, memberIndex) {
  return `<div class="d-assigned-member-cards">
                <div class="d-assigned-member-icon" style="background-color: var(--color-variant${memberIndex})">
                  ${memberInitials}
                </div>
                <p>${member}</p>
              </div>`;
}

export function getTemplateSubtask(subtask, taskId) {
  return `<div class="d-subtask">
                <input type="checkbox" id="d-subtask-${taskId}" value="${subtask}"/>
                <label for="d-subtask-${taskId}">${subtask}</label>
              </div>`;
}

export function getTemplateMarkedUser(memberIndex, memberInitials) {
  return `<div class="marked-user marked-user-${memberIndex}" style="background-color: var(--color-variant${memberIndex});">${memberInitials}</div>`
}

export function getTemplateRemainingMembers(memberIndex, remainingMembers) {
  return `<div class="marked-user marked-user-${memberIndex}" style="background-color: var(--color-variant-over);">+${remainingMembers}</div>`
}
