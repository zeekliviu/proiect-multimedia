const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const magnifyBtn = document.getElementById("magnifyBtn");
const minifyBtn = document.getElementById("minifyBtn");
const ellipseBtn = document.getElementById("ellipseBtn");
const selectBtn = document.getElementById("selectBtn");
const rectBtn = document.getElementById("rectBtn");
const lineBtn = document.getElementById("lineBtn");
const MIN_WIDTH = 300;
const CANVAS_BORDER = 0.5;
const currentTool = {
  name: undefined,
  reference: undefined,
  color: "black",
  size: 1,
};

magnifyBtn.onclick = () => {
  if (2 * canvas.width < window.innerWidth) {
    canvas.width *= 2;
    canvas.height *= 2;
  }
};

minifyBtn.onclick = () => {
  if (canvas.width / 2 > MIN_WIDTH) {
    canvas.width /= 2;
    canvas.height /= 2;
  }
};

const updateTool = (name, reference) => {
  currentTool.name = name;
  currentTool.reference = reference;
};

ellipseBtn.onclick = () => {
  if (currentTool.reference !== undefined)
    currentTool.reference.style.backgroundColor = "#6a0dad";
  updateTool("ellipse", ellipseBtn);
  ellipseBtn.style.backgroundColor = "blue";
};

rectBtn.onclick = () => {
  if (currentTool.reference !== undefined)
    currentTool.reference.style.backgroundColor = "#6a0dad";
  updateTool("rect", rectBtn);
  rectBtn.style.backgroundColor = "blue";
};

selectBtn.onclick = () => {
  if (currentTool.reference !== undefined)
    currentTool.reference.style.backgroundColor = "#6a0dad";
  updateTool("select", selectBtn);
  selectBtn.style.backgroundColor = "blue";
};

lineBtn.onclick = () => {
  if (currentTool.reference !== undefined)
    currentTool.reference.style.backgroundColor = "#6a0dad";
  updateTool("line", lineBtn);
  lineBtn.style.backgroundColor = "blue";
};

canvas.onmouseenter = (e) => {};

canvas.onmousemove = (e) => {
  if (currentTool.name === undefined) return;
  if (currentTool.name === "select") return;
  if (
    e.offsetX > CANVAS_BORDER &&
    e.offsetY > CANVAS_BORDER &&
    e.offsetX < canvas.width - CANVAS_BORDER &&
    e.offsetY < canvas.height - CANVAS_BORDER
  )
    canvas.style.cursor = "crosshair";
  else canvas.style.cursor = "auto";
};

canvas.onmouseleave = () => {
  canvas.style.cursor = "auto";
};
