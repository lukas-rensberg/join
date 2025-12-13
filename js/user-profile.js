import { auth } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/**
 * Update avatar initials based on logged-in user
 */
function updateAvatarInitials() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const avatarElement = document.querySelector(".avatar");

      if (avatarElement) {
        let initials = "U"; // Default

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
          initials = "GU"; // Guest User
        }

        avatarElement.textContent = initials;
      }
    }
  });
}

// Initialize avatar when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateAvatarInitials);
} else {
  updateAvatarInitials();
}

