/**
 * Priority Management Functions
 * Handles priority button selection and icon updates
 */

/**
 * Handles priority button selection
 * @param {HTMLElement} clickedButton - The clicked priority button
 */
export function selectPriority(clickedButton) {
    const allPriorityButtons = document.querySelectorAll('.priority-btn');
    allPriorityButtons.forEach(button => {
        button.classList.remove('active');
        updatePriorityIcon(button, false);
    });

    clickedButton.classList.add('active');
    updatePriorityIcon(clickedButton, true);
}

/**
 * Updates the priority icon based on active state
 * @param {HTMLElement} button - The priority button
 * @param {boolean} isActive - Whether the button is active
 */
function updatePriorityIcon(button, isActive) {
    const img = button.querySelector('img');

    if (button.classList.contains('urgent')) {
        img.src = isActive ? './assets/priority_icons/urgent.svg' : './assets/priority_icons/prio_urgent_colored.svg';
    } else if (button.classList.contains('medium')) {
        img.src = isActive ? './assets/priority_icons/medium.svg' : './assets/priority_icons/prio_medium_colored.svg';
    } else if (button.classList.contains('low')) {
        img.src = isActive ? './assets/priority_icons/low.svg' : './assets/priority_icons/prio_low_colored.svg';
    }
}

/**
 * Initializes priority button event listeners
 */
export function initializePriorityButtons() {
    const priorityButtons = document.querySelectorAll('.priority-btn');
    priorityButtons.forEach(button => {
        button.addEventListener('click', () => selectPriority(button));
    });
}

/**
 * Gets the currently selected priority
 * @returns {string} The selected priority ('urgent', 'medium', or 'low')
 */
export function getSelectedPriority() {
    const activeButton = document.querySelector('.priority-btn.active');
    if (!activeButton) return 'medium'; // Default to medium if nothing selected

    if (activeButton.classList.contains('urgent')) return 'urgent';
    if (activeButton.classList.contains('medium')) return 'medium';
    if (activeButton.classList.contains('low')) return 'low';

    return 'medium'; // Fallback
}
