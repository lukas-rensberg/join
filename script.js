
/**
 * Slide the card swap menu into view and attach an outside-click handler to close it.
 */
function handleOutsideClick(event) {
    const swapMenu = document.getElementById("cardLegalLinks");
    const toggleButton = document.getElementById("toggleSideMenu");
    const label = toggleButton?.parentElement;
    const checkbox = document.getElementById("slideInSideMenu");

    if (checkbox?.checked &&
        !swapMenu?.contains(event.target) &&
        !toggleButton?.contains(event.target) &&
        !label?.contains(event.target)) {
        slideOutMenu();
    }
}

/**
 * Slide the card swap menu out of view.
 */
function slideOutMenu() {
    const toggleLLCheckbox = document.getElementById("slideInSideMenu");
    if (toggleLLCheckbox && toggleLLCheckbox.checked) {
        toggleLLCheckbox.checked = false;
    }
}

/**
 * Utility "function" for multi-toggling of two classes
 * @param {HTMLElement} element - The element to toggle
 * @param {String} class0 - First class for toggling
 * @param {String} class1 - Second class for toggling
 */
const superToggle = function (element, class0, class1) {
    element.classList.remove(class0);
    element.classList.add(class1);
}

document.addEventListener("mousedown", function (event) {
    handleOutsideClick(event);
});