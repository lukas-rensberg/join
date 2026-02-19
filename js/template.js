/**
 * Checks if text contains HTML special characters that would need escaping.
 * @param {string} text - The text to check.
 * @returns {boolean} True if the text contains HTML special characters.
 */
export function containsHtmlChars(text) {
    if (!text) return false;
    return /[<>&"']/.test(text);
}

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
}

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

/**
 * Returns the full dialog HTML for a task element.
 * Note: the caller should provide or set `dueDate` into the template scope before inserting.
 * @param {Object} element - Task object containing title, text, priority, task, id, etc.
 * @param {string} dueDate - Formatted due date string to display.
 * @returns {string} HTML string for the dialog.
 */
export function getTemplateDialog(element, dueDate) {
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
            <p>${dueDate}</p>
          </div>
          <div class="d-due-date-prio">
            <p><strong>Priority:</strong></p>
            <p class="p-prio">${element["priority"].charAt(0).toUpperCase() + element["priority"].slice(1)}</p>
            <img src="./assets/priority_icons/prio_${element["priority"]}_colored.svg" alt="prio ${element["priority"]}" />
          </div>
          <div class="d-assigned-to">
            <p><strong>Assigned to:</strong></p>
            <div class="d-assigned-members" id="d-assigned-members">
            </div>
          </div>
          <div class="d-subtasks">
            <p><strong>Subtasks:</strong></p>
            <div class="d-subtasks-check">
          </div>
        </section>
        <div class="d-card-footer">
          <div class="d-card-footer-d">Delete</div>
          <div class="d-card-footer-e"></div>
        </div>
      </div>`;
}

/**
 * Returns the HTML for a task card used in the board columns.
 * @param {Object} element - Task object with id, title, text, priority, task, etc.
 * @param {Array} subtasksDone - Array of completed subtasks for progress display.
 * @param {number} totalSubtasks - Total number of subtasks for progress calculation.
 * @param {number} progressWidth - Calculated width percentage for progress bar.
 * @returns {string} HTML string for the task card.
 */

export function getTemplateTaskCard(element, subtasksDone, totalSubtasks, progressWidth) {
    return `<div class="task-card" data-task-id="${element["id"]}" draggable="true" onclick="openDialog('${element["id"]}')" ondragstart="startDragging('${element["id"]}')" ondragend="handleDragEnd()" ontouchmove="startDragging('${element["id"]}')">
                            <div class="card-headline">
                                <div class="card-label card-bg-${element["task"].split(" ")[0].toLowerCase()}-${element["task"].split(" ")[1].toLowerCase()}">${element["task"]}</div>
                                <div class="card-swap-icon" onclick="toggleSwapMenu(event, '${element["id"]}', '${element["category"]}')">
                                    <div class="card-swap-dropdown" id="swap-dropdown-${element["id"]}">
                                        <h5>Move to</h5>
                                        <div class="move-to-do" data-category="to-do" onclick="moveTaskTo(event, '${element["id"]}', 'to-do')">
                                            <span>To-do</span>
                                        </div>
                                        <div class="move-to-do" data-category="in-progress" onclick="moveTaskTo(event, '${element["id"]}', 'in-progress')">
                                            <span>In progress</span>
                                        </div>
                                        <div class="move-to-do" data-category="await-feedback" onclick="moveTaskTo(event, '${element["id"]}', 'await-feedback')">
                                            <span>Await feedback</span>
                                        </div>
                                        <div class="move-to-do" data-category="done" onclick="moveTaskTo(event, '${element["id"]}', 'done')">
                                            <span>Done</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-task-wrapper">
                              <div class="card-task-title">${element["title"]}</div>
                              <div class="card-task-text">${element["text"]}</div>
                              <div class="card-progress-container" id="card-progress-container-${element["id"]}">
                                  <div class="card-progress-bar">
                                      <div class="card-sub-progress-bar" style="width: ${progressWidth}%;"></div>
                                  </div>
                                  <div id="tasks-done">${subtasksDone.length}/${totalSubtasks} Subtasks</div>
                              </div>
                            </div>
                            <div class="user-prio-container">
                                <div class="marked-user-container" id="marked-user-container-${element["id"]}">
                                </div>
                                <div class="card-prio-icon"
                                    style="background: url('./assets/priority_icons/prio_${element["priority"]}_colored.svg') center center no-repeat;">
                                </div>
                            </div>
                        </div>`;
}

/**
 * Returns the HTML template shown when a column has no tasks.
 * @param {string} section - Display name for the empty state message.
 * @returns {string} HTML string for the empty state display.
 */
export function getNoTaskTemplate(section) {
    return `<div class="no-tasks">No tasks ${section}</div>`;
}

/**
 * Returns HTML for a member card used inside the task dialog's assigned members.
 * @param {string} memberName - Full name of the member.
 * @param {string} memberInitials - Initials to display in the avatar.
 * @param {string} avatarColor - Background color for the avatar.
 * @returns {string} HTML string for a member card.
 */
export function getTemplateMember(memberName, memberInitials, avatarColor) {
    return `<div class="d-assigned-member-cards">
                <div class="d-assigned-member-icon" style="background-color: ${avatarColor};">
                  ${memberInitials}
                </div>
                <p>${memberName}</p>
              </div>`;
}

/**
 * Returns HTML for a single subtask checkbox entry.
 * @param {string} subtask - Subtask text.
 * @param {string} taskId - Parent task id.
 * @param {number} index - Index of the subtask.
 * @param {boolean} isCompleted - Whether the subtask is completed.
 * @returns {string} HTML markup for the subtask.
 */
export function getTemplateSubtask(subtask, taskId, index, isCompleted) {
    const uniqueId = `subtask-${taskId}-${index}`;
    return `<div class="d-subtask">
                <input type="checkbox" id="${uniqueId}" value="${subtask}" ${isCompleted ? 'checked' : ''} data-task-id="${taskId}" data-subtask="${subtask}"/>
                <label for="${uniqueId}">${subtask}</label>
              </div>`;
}

/**
 * Returns HTML for a small marked user avatar shown on task cards.
 * @param {number} memberIndex - Index used for generating class names and fallback color.
 * @param {string} memberInitials - Initials to display inside the avatar.
 * @param {string} [avatarColor] - Optional avatar background color.
 * @returns {string} HTML string for the marked user avatar.
 */
export function getTemplateMarkedUser(memberIndex, memberInitials, avatarColor) {
    return `<div class="marked-user marked-user-${memberIndex}" style="background-color: ${avatarColor || `var(--color-variant${memberIndex})`};">${memberInitials}</div>`
}

/**
 * Returns HTML for the "+N" remaining-members indicator shown when a task has more than three members.
 * @param {number} memberIndex - Index used for generating class name.
 * @param {number} remainingMembers - Number of additional members to show.
 * @returns {string} HTML string for the remaining-members indicator.
 */
export function getTemplateRemainingMembers(memberIndex, remainingMembers) {
    return `<div class="marked-user marked-user-${memberIndex}" style="background-color: var(--color-variant-over);">+${remainingMembers}</div>`
}

/**
 * Creates HTML for a subtask item
 * @param {string} text - The subtask text content
 * @returns {string} HTML string for the subtask
 */
export function createSubtaskHTML(text) {
    return `
    <span class="subtask-text">${text}</span>
    <div class="subtask-actions">
      <img src="./assets/icons/edit.svg" alt="Edit" class="subtask-edit" />
      <span class="subtask-separator"></span>
      <img src="./assets/icons/delete.svg" alt="Delete" class="subtask-delete" />
    </div>
  `;
}

/**
 * Creates HTML for edit mode action buttons
 * @returns {string} HTML string for edit actions
 */
export function createEditActionsHTML() {
    return `
    <img src="./assets/icons/delete.svg" alt="Cancel" class="cancel-edit" />
    <span class="subtask-separator"></span>
    <img src="./assets/icons/check-blue.svg" alt="Save" class="save-edit" />
  `;
}

/**
 * Creates HTML for normal mode action buttons (edit and delete)
 * @returns {string} HTML string for normal actions
 */
export function createNormalActionsHTML() {
    return `
    <img src="./assets/icons/edit.svg" alt="Edit" class="subtask-edit" />
    <span class="subtask-separator"></span>
    <img src="./assets/icons/delete.svg" alt="Delete" class="subtask-delete" />
  `;
}

/**
 * Generates HTML for a contact option in the dropdown list
 * @param {Object} contact - The contact object
 * @param {string} contact.id - Contact ID
 * @param {string} contact.avatarColor - Background color for the avatar
 * @param {string} contact.initials - Contact initials
 * @param {string} contact.name - Contact's full name
 * @param {string} contact.email - Contact's email address
 * @returns {string} HTML string for the contact option
 */
export function generateContactOptionHTML(contact) {
    return `
      <div class="contact-option-avatar" style="background-color: ${contact.avatarColor};">
        ${contact.initials}
      </div>
      <div class="contact-option-info">
        <div class="contact-option-name">${contact.name}</div>
        <div class="contact-option-email">${contact.email}</div>
      </div>
      <div class="contact-option-checkbox">
        <input type="checkbox" name="checkbox-${contact.id}" id="checkbox-${contact.id}">
        <label for="checkbox-${contact.id}"></label>
      </div>
    `;
}

/**
 * Generates HTML for a contact chip (small avatar representation)
 * @param {Object} contact - The contact object
 * @param {string} contact.avatarColor - Background color for the avatar
 * @param {string} contact.name - Contact's full name (used for title attribute)
 * @param {string} contact.initials - Contact initials to display
 * @returns {string} HTML string for the contact chip
 */
export function getContactChipHTML(contact) {
    return `
      <div class="contact-avatar-small" style="background-color: ${contact.avatarColor};" title="${contact.name}">
        ${contact.initials}
      </div>
    `;
}

/**
 * Generates HTML for a category option in the dropdown
 * @param {Object} category - The category object
 * @param {string} category.name - Category name to display
 * @returns {string} HTML string for the category option
 */
export function getCategoryOptionHTML(category) {
    return `
      <div class="category-option-name">${category.name}</div>
    `;
}

/**
 * Generates the complete HTML template for the add task form
 * @returns {string} HTML string containing the entire add task form structure
 */
export function getTemplateAddTask() {
    return `<div class="form-group form-group-title">
                    <input aria-label="Task Title" type="text" class="input-title" placeholder="Enter a title" />
                </div>

                <div class="form-group">
                    <label class="desc-label">Description <span class="optional">(optional)</span></label>
                    <textarea aria-label="Description" class="task-description"
                        placeholder="Enter a Description"></textarea>
                </div>

                <div class="form-group">
                    <label>Due date</label>
                    <div class="input-with-icon">
                        <input type="text" class="date-input-hidden"/>
                        <label class="icon calendar-icon">
                            <img src="./assets/icons/calendar.svg" alt="Calendar"/>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Priority</label>
                    <div class="priority-selection">
                        <button class="priority-btn urgent" type="button">
                            Urgent
                            <img src="./assets/priority_icons/prio_urgent_colored.svg" alt="Image with two arrows up"/>
                        </button>
                        <button class="priority-btn medium active" type="button">
                            Medium
                            <img src="./assets/priority_icons/medium.svg" alt="Image with two stripes horizontal"/>
                        </button>
                        <button class="priority-btn low" type="button">
                            Low
                            <img src="./assets/priority_icons/prio_low_colored.svg" alt="Image with two arrows down"/>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Assigned to <span class="optional">(optional)</span></label>
                    <div class="custom-dropdown contact-dropdown-wrapper">
                        <div class="dropdown-header contact-dropdown-header">
                            <input type="text" class="dropdown-search-input contact-search-input"
                                placeholder="Select contacts to assign"/>
                            <img src="./assets/menu_icons/arrow-drop-down.svg" class="dropdown-arrow"
                                alt="Little Image indicating an dropdown"/>
                        </div>
                        <div class="dropdown-content contact-dropdown-content">
                        </div>
                    </div>
                    <div class="dropzone"></div>
                </div>

                <div class="form-group">
                    <label>Category</label>
                    <div class="custom-dropdown category-dropdown-wrapper">
                        <div class="dropdown-header category-dropdown-header">
                            <span class="dropdown-display-text category-display">Select task category</span>
                            <img src="./assets/menu_icons/arrow-drop-down.svg" class="dropdown-arrow"
                                alt="Little Image indicating an dropdown"/>
                        </div>
                        <div class="dropdown-content category-dropdown-content">
                        </div>
                    </div>
                </div>

                <div class="form-group mobile-last">
                    <label>Subtasks <span class="optional">(optional)</span></label>
                    <div class="input-with-icon subtask-input-wrapper">
                        <input type="text" class="subtask-input" placeholder="Add a subtask"/>
                        <div class="subtask-icons">
                            <img src="./assets/icons/close.svg" alt="Cancel" class="icon-cancel"/>
                            <span class="icon-separator"></span>
                            <img src="./assets/icons/check-blue.svg" alt="Confirm" class="icon-confirm"/>
                        </div>
                    </div>
                    <ul class="subtask-list"></ul>
                </div>`;
}


export function generateLoggedOutHeaderHTML() {
    return `    
    <section class="header">
        <img src="./assets/icons/logo-white.svg" alt="Join Logo"/>
        <div class="header-right">
            <span class="header-title">Kanban Project Management Tool</span>
        </div>
    </section>
  `;
}

export function generateLoggedInHeaderHTML(userInitials) {
    return `
    <section class="header">
        <img src="./assets/icons/logo-white.svg" alt="Join Logo"/>
        <div class="header-right">
          <div class="help-container">
            Kanban Project Management Tool
            <a href="help.html"><img src="./assets/icons/question_mark.svg" alt="Help"></a>
          </div>
          <input type="checkbox" id="slideInSideMenu"/>
          <label for="slideInSideMenu">
            <div class="avatar" id="toggleSideMenu">${userInitials}</div>
          </label>
          <div class="side-menu" id="cardLegalLinks">
            <nav>
              <a class="link-none" href="help.html">Help</a>
              <a href="legalNotice.html">Legal Notice</a>
              <a href="privacy.html">Privacy Policy</a>
              <a href="#" id="logoutLink">Log Out</a>
            </nav>
          </div>
        </div>
    </section>
  `;
}

/**
 * Generates HTML for the aside navigation when the user is NOT logged in
 * @param {string} navLinksBottom
 * @returns {string}
 */
export function generateLoggedOutAsideHTML(navLinksBottom) {
    return `
      <div class="aside-navbar">
        <a href="index.html" class="login-link">
          <img src="./assets/menu_icons/login.svg" alt="Login Icon"/>
          Log in
        </a>
      </div>
      <div class="aside-links">
        ${navLinksBottom}
      </div>
    `;
}

/**
 * Generates HTML for the aside navigation when the user is logged in
 * @param {string} navLinks
 * @param {string} navLinksBottom
 * @returns {string}
 */
export function generateLoggedInAsideHTML(navLinks, navLinksBottom) {
    return `
      <div class="aside-navbar">
        ${navLinks}
      </div>
      <div class="aside-links">
        ${navLinksBottom}
      </div>
    `;
}

/**
 * Returns the HTML template for the edit task form with proper wrapper and close button
 * @returns {string} HTML string for the edit task form
 */
export function getEditTaskTemplate() {
    return `
        <div class="edit-task-header">
            <div class="close-edit-dialog"></div>
        </div>
        <div class="add-task-form edit-task-form">
            ${getTemplateAddTask()}
        </div>
        <div class="d-card-footer">
            <button class="confirm-edit-task-btn"></button>
        </div>
    `;
}

export function generateNavlinkWithActiveState(item, isActive) {
    return `
        <a class="nav-item${isActive}" href="${item.href}">
          <span class="${item.class}">${item.label}</span>
        </a>
    `;
}

export function generateFooterWithActiveStates(isPrivacyActive, isLegalActive) {
    return `
      <a class="nav-item" href="index.html">
        <img src="./assets/menu_icons/login.svg" alt="Login" class="footer-login-icon"/>
        <span class="nav-login">Log In</span>
      </a>
      <div class="footer-separator">
        <a class="legal-link${isPrivacyActive}" href="privacy.html">Privacy Policy</a>
        <a class="legal-link${isLegalActive}" href="legalNotice.html">Legal Notice</a>
      </div>
    `;
}