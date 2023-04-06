// Based on https://stackoverflow.com/a/54070620/91238 .
// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsv(r, g, b) {
  let v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  let h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

// For the whole color wheel, radius and center x/y.
const radius = 512;
const cx = radius;
const cy = radius;

const svg = document.querySelector("svg");
const styleSheet = document.styleSheets[0];

// TODO: Select-able color categories, re-render wheel.
function renderWheel() {
  let colorsBySite = {};
  let sites = [];
  Object.entries(colors).forEach(([name, color], _) => {
    let [r, g, b] = color;
    let [h, s, v] = rgb2hsv(r / 255, g / 255, b / 255);

    // Based on https://stackoverflow.com/a/54522007/91238 .
    // I've tweaked it to spread out some of the colors (especially they greys)
    // that don't fit well into a true H/S wheel.
    let colorRadius = (s + v / 5) * 0.75 * radius;
    let colorAngle = (h / 360) * 2 * Math.PI;

    let x = Math.cos(colorAngle) * colorRadius + cx;
    let y = Math.sin(colorAngle) * colorRadius + cy;
    sites.push({ x: x, y: y });
    colorsBySite[[x, y]] = name;
  });

  let voronoi = new Voronoi().compute(sites, {
    xl: 0,
    xr: 1024,
    yt: 0,
    yb: 1024,
  });
  voronoi.cells.forEach((cell) => {
    if (cell.closeMe) {
      console.warn("cell", cell, "needs closing");
      return;
    }
    let colorName = colorsBySite[[cell.site.x, cell.site.y]];
    let [r, g, b] = colors[colorName];

    let c = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    c.setAttribute("data-color", colorName);
    // c.setAttribute("mask", "url(#circle-mask)");

    let points = "";
    cell.halfedges.forEach((edge) => {
      let s = edge.getStartpoint();
      let e = edge.getEndpoint();
      points += `${s.x} ${s.y}, `;
    });
    points = points.replace(/, $/, "");
    c.setAttribute("points", points);

    let rgb = `${r}, ${g}, ${b}`;
    c.style = `--color: ${rgb};`;
    c.setAttribute("tabindex", 0);
    svg.appendChild(c);
  });
}
renderWheel();

// https://stackoverflow.com/a/5624139/91238
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
