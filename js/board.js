let dialogRef = document.querySelector("dialog");

let tasks = [
    {
        'id': 'to-do-1',
        'task': 'User Story',
        'title': 'Kochwelt Page & Recipe Recommender',
        'text': 'Build start page with recipe recommandation...',
        'subtasks': '',
        'member': ['AM', 'EM', 'MM'],
        'priority': 'medium',
        'category': 'to-do',
    },
    {
        'id': 'to-do-2',
        'task': 'Technical Task',
        'title': 'HTML Base Template Creation',
        'text': 'Create reusable HTML base templates...',
        'subtasks': '',
        'member': ['AM', 'EM', 'MM'],
        'priority': 'urgent',
        'category': 'to-do',
    }
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
* Open dialog
*/
function openDialog() {
    dialogRef.classList.add("dialog-swipe-in");
    dialogRef.showModal();
}

/**
* Close Dialog
*/
function closeDialog() {
    dialogRef.classList.remove("dialog-swipe-in");
    dialogRef.close();
}


/**
 * Start of Dragging and updating HTML
 * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
 */

function updateHTML() {
    /**
    * To do Tasks
    */
    let toDo = tasks.filter(t => t['category'] == 'to-do');
    const toDoRef = document.getElementById('to-do');

    toDoRef.innerHTML = '';

    if (toDo.length === 0) {
        toDoRef.innerHTML = getNoTaskTemplate("to do");
    } else {
        for (let index = 0; index < toDo.length; index++) {
            toDoRef.innerHTML += getTemplateTaskCard(toDo[index]);
        }
    }

    /**
    * In Progress Tasks
    */
    let inProgress = tasks.filter(t => t['category'] == 'in-progress');
    const inProgressRef = document.getElementById('in-progress');

    inProgressRef.innerHTML = '';

    if (inProgress.length === 0) {
        inProgressRef.innerHTML = getNoTaskTemplate("in progress");
    } else {
        for (let index = 0; index < inProgress.length; index++) {
            const element = inProgress[index];
            inProgressRef.innerHTML += getTemplateTaskCard(element);
        }
    }

    /**
    * Await Feedback Tasks
    */
    let awaitFeedback = tasks.filter(t => t['category'] == 'await-feedback');
    const awaitFeedbackRef = document.getElementById('await-feedback');

    awaitFeedbackRef.innerHTML = '';

    if (awaitFeedback.length === 0) {
        awaitFeedbackRef.innerHTML = getNoTaskTemplate("awaiting feedback");
    } else {
        for (let index = 0; index < awaitFeedback.length; index++) {
            const element = awaitFeedback[index];
            awaitFeedbackRef.innerHTML += getTemplateTaskCard(element);
        }
    }

    /**
    * Done Tasks
    */
    let done = tasks.filter(t => t['category'] == 'done');
    const doneRef = document.getElementById('done');

    doneRef.innerHTML = '';

    if (done.length === 0) {
        doneRef.innerHTML = getNoTaskTemplate("done");
    } else {
        for (let index = 0; index < done.length; index++) {
            const element = done[index];
            doneRef.innerHTML += getTemplateTaskCard(element);
        }
    }
}

function startDragging(id) {
    currentDraggedElement = id;
    document.getElementById(currentDraggedElement).classList.add('is-dragging');
}

function allowDrop(event) {
    event.preventDefault();
}

function moveTo(category) {
    tasks.forEach(task => {
        if (task['id'] == currentDraggedElement) {
            task['category'] = category;
        }
    });
    document.getElementById(currentDraggedElement).classList.remove('is-dragging');
    bgContainerRemove(category);    
    updateHTML();
}

function bgContainer(id) {
    document.getElementById(id).classList.add('task-card-container-dragover');
}

function bgContainerRemove(id) {
    hideDashedBox(id)
    document.getElementById(id).classList.remove('task-card-container-dragover');
}

function getTemplateTaskCard(element) {
    return `<div class="task-card" id="${element['id']}" draggable="true" onclick="openDialog('${element['id']}')" ondragstart="startDragging('${element['id']}')">
                            <div class="card-headline">
                                <div class="card-label card-bg-${element['task'].split(" ")[0].toLowerCase()}-${element['task'].split(" ")[1].toLowerCase()}">${element['task']}</div>
                                <div class="card-swap-icon"></div>
                            </div>
                            <div class="card-task-title">${element['title']}</div>
                            <div class="card-task-text">${element['text']}</div>
                            <div class="card-progress-container">
                                <div class="card-progress-bar">
                                    <div class="card-sub-progress-bar" style="width: 50%;"></div>
                                </div>
                                <div id="tasks-done">1/2 Subtasks</div>
                            </div>
                            <div class="user-prio-container">
                                <div class="marked-user-container">
                                    <div class="marked-user" style="background-color: var(--color-default);">${element['member'][0]}</div>
                                    <div class="marked-user marked-user-2"
                                        style="background-color: var(--color-variant1);">${element['member'][1]}</div>
                                    <div class="marked-user marked-user-3"
                                        style="background-color: var(--color-variant11);">${element['member'][2]}</div>
                                    <div class="marked-user marked-user-4"
                                        style="background-color: var(--color-variant12);">+11</div>
                                </div>
                                <div class="card-prio-icon"
                                    style="background: url(./assets/priority_icons/prio_${element['priority']}_colored.svg) center center no-repeat;">
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
    const noTasksElem = container.querySelector('.no-tasks');
    if (noTasksElem) {
        noTasksElem.style.display = 'none';
    }
    if (!container.querySelector('.empty-card')) {
        container.innerHTML += generateEmptyCard();
    }
}

function hideDashedBox(section) {
    const container = document.getElementById(section);
    const noTasksElem = container.querySelector('.no-tasks');
    if (noTasksElem) {
        noTasksElem.style.display = 'flex';
    }
    const emptyCard = container.querySelector('.empty-card');
    if (!emptyCard) return;
    emptyCard.parentNode.removeChild(emptyCard)
}

function generateEmptyCard() {
    return `<div class="empty-card"></div>`
}