import {auth} from "./database.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {generateAvatarHTML} from "./template";

/**
 * Render header elements only when logged in
 * @param {object|null} user - Firebase user object or null
 */
function renderAuthenticatedHeader(user) {
    const header = document.querySelector(".header-right");
    if (!header) return;

    header.querySelector(".help-link")?.remove();
    header.querySelector(".avatar-wrapper")?.remove();
    if (!user) return;

    const helpLink = document.createElement("a");
    helpLink.href = "help.html";
    helpLink.className = "help-link";
    helpLink.innerHTML = '<img src="./assets/icons/question_mark.svg" alt="Help">';

    const avatar = document.createElement("div");
    avatar.className = "avatar-wrapper";
    avatar.innerHTML = generateAvatarHTML(user);

    header.querySelector(".help-container")?.append(helpLink, avatar);
}

export function renderContact(user) {
    let initials = "U";
    if (user.displayName) {
        const nameParts = user.displayName.trim().split(" ");
        if (nameParts.length >= 2) {
            initials = nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
        } else {
            initials = nameParts[0][0].toUpperCase() + (nameParts[0][1] || "").toUpperCase();
        }
    } else if (user.email) {
        initials = user.email[0].toUpperCase() + (user.email[1] || "").toUpperCase();
    } else if (user.isAnonymous) {
        initials = "GU";
    }
    return initials;
}

/**
 * Initialize auth state listener for header
 */
export function updateAvatarInitials() {
    onAuthStateChanged(auth, (user) => { renderAuthenticatedHeader(user) });
}

document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", updateAvatarInitials)
    : updateAvatarInitials();

