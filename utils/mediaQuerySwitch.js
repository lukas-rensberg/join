const desktopMediaQuery = window.matchMedia("(min-width: 812px)");

/**
 * Checks if the current viewport is desktop size
 * @returns {boolean} True if viewport width >= 812px
 */
export function isDesktop() {
    return desktopMediaQuery.matches;
}

/**
 * Handles media query changes for the board.
 * If switching to mobile while add-task dialog is open, closes dialog and redirects to add-task.html.
 * @param {MediaQueryListEvent} event - The media query change event
 * @returns {void}
 */
export function handleBoardMediaQueryChange(event) {
    if (!event.matches && addTaskRef && addTaskRef.open) {
        swipeOutAddTaskAside();
        setTimeout(() => {
            window.location.href = `add-task.html?category=${targetCategory}`;
        }, 300);
    }

    if (dialogRef.open) {
        if (event.matches) {
            dialogRef.classList.remove("dialog-swipe-in-mobile");
            return dialogRef.classList.add("dialog-swipe-in-desktop");
        }
        dialogRef.classList.remove("dialog-swipe-in-desktop");
        dialogRef.classList.add("dialog-swipe-in-mobile");
    }
}