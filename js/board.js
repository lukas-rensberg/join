let dialogRef = document.querySelector("dialog");

// slide in menu
function swapMenuSlideIn() {
    const swapMenu = document.getElementById("card-swap-menu");
    swapMenu.classList.remove("slide-out-swap-menu");
    swapMenu.classList.add("slide-in-swap-menu");

    // listener for clicking outside menu to close menu
    document.addEventListener("mousedown", handleOutsideClick);

    function handleOutsideClick(event) {
        if (!swapMenu.contains(event.target)) {
            slideOutMenu();
            document.removeEventListener("mousedown", handleOutsideClick);
        }
    }
}

// slide out menu
function slideOutMenu() {
    const swapMenu = document.getElementById("card-swap-menu");
    swapMenu.classList.remove("slide-in-swap-menu");
    swapMenu.classList.add("slide-out-swap-menu");
}

// open dialog
function openDialog() {
    dialogRef.classList.add("dialog-swipe-in");
    dialogRef.showModal();
}

function closeDialog() {
    dialogRef.classList.remove("dialog-swipe-in");
    dialogRef.close();
}