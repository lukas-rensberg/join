import {getTargetCategory, swipeOutAddTaskAside} from "./addTaskAside.js";

export const desktopMediaQuery = window.matchMedia("(min-width: 812px)");

/**
 * Checks if the current viewport is desktop size
 * @returns {boolean} True if viewport width >= 812px
 */
export function isDesktop() {
    return desktopMediaQuery.matches;
}

/**
 * Handles media query changes for the board.
 * If switching to mobile while add-task dialog is open, closes dialog and redirects to addTask.html.
 * @param {MediaQueryListEvent} event - The media query change event
 * @returns {void}
 */
export function handleBoardMediaQueryChange(event) {
    let addTaskRef = document.getElementById("aside-add-task");
    let dialogRef = document.getElementById("dialog-task");
    if (!event.matches && addTaskRef && addTaskRef.open) {
        swipeOutAddTaskAside();
        setTimeout(() => {
            window.location.href = `addTask.html?category=${getTargetCategory()}`;
        }, 300);
    }
    if (dialogRef.open) {
        dialogIsOpen(dialogRef, event);
    }
}

/**
 * Handles dialog styling when viewport size changes between desktop and mobile.
 * Toggles CSS classes for appropriate swipe-in animations based on screen size.
 * @param {HTMLDialogElement} dialogRef - Reference to the dialog element
 * @param {MediaQueryListEvent} event - The media query change event
 * @returns {void}
 */
function dialogIsOpen(dialogRef, event) {
    if (event.matches) {
        dialogRef.classList.remove("dialog-swipe-in-mobile");
        return dialogRef.classList.add("dialog-swipe-in-desktop");
    }
    dialogRef.classList.remove("dialog-swipe-in-desktop");
    dialogRef.classList.add("dialog-swipe-in-mobile");
}

