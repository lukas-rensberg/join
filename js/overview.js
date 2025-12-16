import { auth } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

/**
 * Get greeting based on current time
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 12) {
    return "Good morning";
  } else if (hour > 12 && hour <= 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

/**
 * Update greeting and user name on the overview page
 */
function updateGreeting() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const greetingContainer = document.querySelector(".greeting-container");
      const greetingElement = document.querySelector(".greeting-container p");
      const nameElement = document.querySelector(".greeting-container .h1-colorized");

      if (greetingElement) {
        // For anonymous users, remove comma and make greeting stand alone
        if (user.isAnonymous) {
          greetingElement.textContent = getTimeBasedGreeting();
          greetingElement.classList.add("greeting-guest");
        } else {
          greetingElement.textContent = getTimeBasedGreeting() + ",";
          greetingElement.classList.remove("greeting-guest");
        }
      }

      if (nameElement) {
        if (user.displayName) {
          nameElement.textContent = user.displayName;
          nameElement.style.display = "block";
        } else if (user.isAnonymous) {
          // Hide name element for guest users
          nameElement.style.display = "none";
        } else if (user.email) {
          // Fallback: Use email name part
          const emailName = user.email.split("@")[0];
          nameElement.textContent = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          nameElement.style.display = "block";
        }
      }

      // Show greeting container after data is loaded
      if (greetingContainer) {
        greetingContainer.classList.add("loaded");
      }

      // Update avatar initials in header
      updateAvatarInitials(user);
    }
  });
}

/**
 * Update avatar initials based on user name
 */
function updateAvatarInitials(user) {
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

/**
 * Add click event listeners to all dashboard cards
 */
function addCardListeners() {
  const cards = document.querySelectorAll('.card, .card-urgent-deadline');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = 'board.html';
    });
  });
}

// Initialize greeting when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    updateGreeting();
    addCardListeners();
  });
} else {
  updateGreeting();
  addCardListeners();
}

