/**
 * Changes the background color of the document body.
 * 
 * @param {string} color - The color value to apply to the background (hex, rgb, or named color)
 */
function changeBackground(color) {
    document.body.style.backgroundColor = color;
  }
  
  /**
   * Changes the color of the logo SVG by modifying the fill attribute of all path elements.
   * Also adds CSS transitions for smooth color changes if not already present.
   * 
   * @param {string} color - The color value to apply to the logo (hex, rgb, or named color)
   */
  
  function changeLogoColor(color) {
    const obj = document.getElementById("iconObj");
    const svgDoc = obj.contentDocument;
    if (!svgDoc) return;
    const svgEl = svgDoc.querySelector("svg");
    const paths = svgEl.querySelectorAll("path");
    if (!svgEl.querySelector("style")) {
      const style = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
      style.textContent = "path { transition: fill 700ms ease-in; }";
      svgEl.appendChild(style);
    }
    paths.forEach((path) => path.setAttribute("fill", color));
  }
  