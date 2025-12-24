
/**
 * Slide the card swap menu into view and attach an outside-click handler to close it.
 */
function handleOutsideClick(event) {
    const swapMenu = document.getElementById("cardLegalLinks");
    const toggleButton = document.getElementById("toggleSideMenu");
    const label = toggleButton?.parentElement;
    const checkbox = document.getElementById("slideInSideMenu");

    // Only close if menu is open and click is outside menu, toggle button, and label
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

document.addEventListener("mousedown", function (event) {
    handleOutsideClick(event);
});