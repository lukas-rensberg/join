/**
 * Initializes the logo animation sequence when the DOM content is loaded.
 * Adds the 'logo-fixed' class to trigger the logo positioning animation,
 * and sets up a transition listener to change the background and logo colors.
 */

document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logo-container");

  logoContainer.classList.add("logo-fixed");
  
  logoContainer.addEventListener("transitionstart", () => {
    changeBackground("white");
    changeLogoColor("#4589FF");
  });
});