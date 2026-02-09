import { auth } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/**
 * Render header elements only when logged in
 * @param {object|null} user - Firebase user object or null
 */
function renderAuthenticatedHeader(user) {
  const headerRight = document.querySelector(".header-right");
  if (!headerRight) return;

  const existingHelpLink = headerRight.querySelector(".help-link");
  const existingAvatarWrapper = headerRight.querySelector(".avatar-wrapper");
  if (existingHelpLink) existingHelpLink.remove();
  if (existingAvatarWrapper) existingAvatarWrapper.remove();

  if (!user) return;

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

  const helpLink = document.createElement("a");
  helpLink.href = "help.html";
  helpLink.className = "help-link";
  helpLink.innerHTML = '<img src="./assets/icons/question_mark_.svg" alt="Question Mark Help">';

  const avatarWrapper = document.createElement("div");
  avatarWrapper.className = "avatar-wrapper";
  avatarWrapper.innerHTML = `
    <input type="checkbox" id="slideInSideMenu" />
    <label for="slideInSideMenu">
      <div class="avatar" id="toggleSideMenu">${initials}</div>
    </label>
    <div class="side-menu" id="cardLegalLinks">
      <nav>
        <a class="link-none" href="help.html">Help</a>
        <a href="legal_notice.html">Legal Notice</a>
        <a href="privacy.html">Privacy Policy</a>
        <a href="index.html">Log Out</a>
      </nav>
    </div>
  `;

  const helpContainer = headerRight.querySelector(".help-container");
  if (helpContainer) {
    helpContainer.appendChild(helpLink);
    helpContainer.after(avatarWrapper);
  }
}

/**
 * Initialize auth state listener for header
 */
export function updateAvatarInitials() {
  onAuthStateChanged(auth, (user) => {
    renderAuthenticatedHeader(user);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateAvatarInitials);
} else {
  updateAvatarInitials();
}

