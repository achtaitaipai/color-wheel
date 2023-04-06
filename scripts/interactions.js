const label = document.getElementById("color-name");
const colorsEl = document.querySelectorAll("[data-color]");
colorsEl.forEach((el) => {
  const activColor = () => {
    const name = el.getAttribute("data-color");
    label.textContent = name;
  };
  el.addEventListener("mouseenter", activColor);
  el.addEventListener("focus", activColor);
});
