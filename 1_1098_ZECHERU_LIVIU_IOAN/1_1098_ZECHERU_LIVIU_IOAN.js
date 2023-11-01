const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

// referințe către butoanele din bara de instrumente
const magnifyBtn = document.getElementById("magnifyBtn");
const minifyBtn = document.getElementById("minifyBtn");
const clearBtn = document.getElementById("clearBtn");
const ellipseBtn = document.getElementById("ellipseBtn");
const selectBtn = document.getElementById("selectBtn");
const rectBtn = document.getElementById("rectBtn");
const lineBtn = document.getElementById("lineBtn");
const saveBtn = document.getElementById("saveBtn");
const exportSVGBtn = document.getElementById("exportSVG");
const listaFiguri = document.getElementById("listaFiguri");
const placeholderLbl = document.getElementById("placeholderLbl");

// referințe către elementele din bara de proprietăți
const cpBgCanvas = document.getElementById("cpBgCanvas");
const cpLineColor = document.getElementById("cpLineColor");
const cpFillColor = document.getElementById("cpFillColor");
const thicknessSlider = document.getElementById("grosimeSlider");
const thicknessValue = document.getElementById("grosimeValue");
const transparencyCb = document.getElementById("transparencyCb");

// constante pentru aspecte ce tin de canvas si figurile desenate; DEFAULT_SIZE reprezintă dimensiunea implicită a unei figuri (raza, lățimea, înălțimea, etc.)
const MIN_WIDTH = 300;
const CANVAS_BORDER = 0.5;
const DEFAULT_SIZE = 10;

// obiectul currentTool va fi folosit pentru a reține informații despre instrumentul curent selectat cu care se vor desena figurile
const currentTool = {
  name: null,
  button: null,
  lineColor: "black",
  fillColor: "white",
  size: 10,
};

// variabile pentru numărul de figuri desenate de fiecare tip (folosite pentru a genera lista de figuri desenate)
let NR_ELIPSE = 0;
let NR_DREPTUNGHIURI = 0;
let NR_LINII = 0;

// variabilă globală pentru a determina ce figura se șterge/modifică
let indexFig = null;

// definirea claselor pentru figurile geometrice; fiecare clasă are un constructor ce inițializează proprietățile figurii și două metode: scaleaza() și deseneaza() - prima este folosită pentru a mări sau micșora figura în funcție de dimensiunea canvas-ului, iar a doua pentru a desena figura pe canvas
class Elipsa {
  constructor(
    x,
    y,
    razaX,
    razaY,
    culoareContur,
    culoareInterior,
    grosimeContur
  ) {
    this.x = x;
    this.y = y;
    this.razaX = razaX;
    this.razaY = razaY;
    this.culoareContur = culoareContur;
    this.culoareInterior = culoareInterior;
    this.grosimeContur = grosimeContur;
  }
  scaleaza(procentaj) {
    this.razaX *= procentaj;
    this.razaY *= procentaj;
    this.x *= procentaj;
    this.y *= procentaj;
  }
  deseneaza() {
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.razaX, this.razaY, 0, 0, 2 * Math.PI);
    ctx.lineWidth = this.grosimeContur;
    ctx.strokeStyle = this.culoareContur;
    ctx.fillStyle = this.culoareInterior;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

class Dreptunghi {
  constructor(
    x,
    y,
    latime,
    inaltime,
    culoareContur,
    culoareInterior,
    grosimeContur
  ) {
    this.x = x;
    this.y = y;
    this.latime = latime;
    this.inaltime = inaltime;
    this.culoareContur = culoareContur;
    this.culoareInterior = culoareInterior;
    this.grosimeContur = grosimeContur;
  }
  scaleaza(procentaj) {
    this.x *= procentaj;
    this.y *= procentaj;
    this.latime *= procentaj;
    this.inaltime *= procentaj;
  }
  deseneaza() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.latime, this.inaltime);
    ctx.lineWidth = this.grosimeContur;
    ctx.strokeStyle = this.culoareContur;
    ctx.fillStyle = this.culoareInterior;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

class Linie {
  constructor(x1, y1, x2, y2, culoare, grosime) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.culoareContur = culoare;
    this.grosimeContur = grosime;
  }
  scaleaza(procentaj) {
    this.x1 *= procentaj;
    this.y1 *= procentaj;
    this.x2 *= procentaj;
    this.y2 *= procentaj;
  }
  deseneaza() {
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.lineWidth = this.grosimeContur;
    ctx.strokeStyle = this.culoareContur;
    ctx.stroke();
    ctx.closePath();
  }
}

// vectorul figuri va conține toate figurile desenate pe canvas
const figuri = [];
let drawing = false; // variabila drawing va fi folosită pentru a ști dacă se desenează sau nu pe canvas

// funcția de mărire a canvas-ului
magnifyBtn.onclick = () => {
  if (2 * canvas.width < window.innerWidth) {
    canvas.width *= 2;
    canvas.height *= 2;
    ctx.fillStyle = cpBgCanvas.value;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    for (const figura of figuri) {
      if (transparencyCb.checked) ctx.globalAlpha = 0.5;
      figura.scaleaza(2);
      figura.deseneaza();
    }
  } else alert("Pânza nu mai poate fi mărită!");
};

// funcția de micșorare a canvas-ului
minifyBtn.onclick = () => {
  if (canvas.width / 2 > MIN_WIDTH) {
    canvas.width /= 2;
    canvas.height /= 2;
    ctx.fillStyle = cpBgCanvas.value;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    for (const figura of figuri) {
      if (transparencyCb.checked) ctx.globalAlpha = 0.5;
      figura.scaleaza(0.5);
      figura.deseneaza();
    }
  } else alert("Pânza nu mai poate fi micșorată!");
};

// funcția de actualizare a instrumentului curent selectat - folosită pentru a schimba culoarea butonului selectat, indicând astfel instrumentul curent
const updateTool = (name, button) => {
  currentTool.name = name;
  currentTool.button = button;
};

ellipseBtn.onclick = () => {
  if (currentTool.button !== null)
    currentTool.button.style.backgroundColor = "#6a0dad";
  updateTool("ellipse", ellipseBtn);
  ellipseBtn.style.backgroundColor = "blue";
};

rectBtn.onclick = () => {
  if (currentTool.button !== null)
    currentTool.button.style.backgroundColor = "#6a0dad";
  updateTool("rect", rectBtn);
  rectBtn.style.backgroundColor = "blue";
};

selectBtn.onclick = () => {
  if (currentTool.button !== null)
    currentTool.button.style.backgroundColor = "#6a0dad";
  updateTool("select", selectBtn);
  selectBtn.style.backgroundColor = "blue";
};

lineBtn.onclick = () => {
  if (currentTool.button !== null)
    currentTool.button.style.backgroundColor = "#6a0dad";
  updateTool("line", lineBtn);
  lineBtn.style.backgroundColor = "blue";
};

// funcția de ștergere a canvas-ului - se va apela la apăsarea butonului „Șterge Canvas”, cât și la desenarea unei figuri noi pentru a realiza efectul de previzualizare
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

canvas.onmousemove = (e) => {
  if (currentTool.name === null) return;
  if (currentTool.name === "select") return;
  if (
    e.offsetX > CANVAS_BORDER &&
    e.offsetY > CANVAS_BORDER &&
    e.offsetX < canvas.width - CANVAS_BORDER &&
    e.offsetY < canvas.height - CANVAS_BORDER
  )
    // verifică dacă cursorul se află în interiorul canvas-ului (interiorul canvas-ului este cu CANVAS_BORDER mai mic decât dimensiunea canvas-ului)
    canvas.style.cursor = "crosshair";
  else canvas.style.cursor = "auto";
  if (drawing) {
    // dacă suntem în modul de desenare, se va șterge canvas-ul și se va desena fiecare figură din vectorul figuri, ținând seama de noile coordonate ale cursorului
    clearCanvas();
    ctx.fillStyle = cpBgCanvas.value;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    switch (figuri[figuri.length - 1].constructor.name) {
      case "Elipsa":
        figuri[figuri.length - 1].razaX = Math.abs(
          e.offsetX - figuri[figuri.length - 1].x
        );
        figuri[figuri.length - 1].razaY = Math.abs(
          e.offsetY - figuri[figuri.length - 1].y
        );
        break;
      case "Dreptunghi":
        figuri[figuri.length - 1].latime =
          e.offsetX - figuri[figuri.length - 1].x;
        figuri[figuri.length - 1].inaltime =
          e.offsetY - figuri[figuri.length - 1].y;
        break;
      case "Linie":
        figuri[figuri.length - 1].x2 = e.offsetX;
        figuri[figuri.length - 1].y2 = e.offsetY;
        break;
    }
    figuri.forEach((figura) => figura.deseneaza());
  }
};

// atunci când se acționează butonul din stânga mouse-ului, se va crea o nouă figură cu proprietățile preluate din currentTool (care le are setate de pe controalele de tip input din stânga) și se va adăuga în vectorul figuri; în ceea ce privește dimensiunile figurii noi, acestea vor fi setate inițial cu valoarea DEFAULT_SIZE, iar la mutarea mouse-ului se va actualiza dimensiunea figurii în funcție de poziția cursorului
canvas.onmousedown = (e) => {
  if (e.button === 2) return;
  if (currentTool.name !== null && canvas.style.cursor === "crosshair") {
    drawing = true;
    switch (currentTool.name) {
      case "ellipse":
        const elipsa = new Elipsa(
          e.offsetX,
          e.offsetY,
          DEFAULT_SIZE,
          DEFAULT_SIZE,
          currentTool.lineColor,
          currentTool.fillColor,
          currentTool.size
        );
        figuri.push(elipsa);
        break;
      case "rect":
        const dreptunghi = new Dreptunghi(
          e.offsetX,
          e.offsetY,
          DEFAULT_SIZE,
          DEFAULT_SIZE,
          currentTool.lineColor,
          currentTool.fillColor,
          currentTool.size
        );
        figuri.push(dreptunghi);
        break;
      case "line":
        const linie = new Linie(
          e.offsetX,
          e.offsetY,
          e.offsetX,
          e.offsetY,
          currentTool.lineColor,
          currentTool.size
        );
        figuri.push(linie);
        break;
    }
  }
};

canvas.onmouseup = (e) => {
  if (currentTool.name !== null && currentTool.name !== "select" && drawing) {
    drawing = false;
    last = figuri[figuri.length - 1];
    adaugaLaLista = true;
    switch (last.constructor.name) {
      case "Elipsa":
        if (last.razaX === DEFAULT_SIZE && last.razaY === DEFAULT_SIZE) {
          figuri.pop();
          adaugaLaLista = false;
        }
        break;
      case "Dreptunghi":
        if (last.latime === DEFAULT_SIZE && last.inaltime === DEFAULT_SIZE) {
          figuri.pop();
          adaugaLaLista = false;
        }
        break;
      case "Linie":
        if (last.x2 === last.x1 && last.y2 === last.y1) {
          figuri.pop();
          adaugaLaLista = false;
        }
        break;
    }
    if (adaugaLaLista) {
      placeholderLbl.setAttribute("hidden", true);
      listaFiguri.removeAttribute("hidden");
      last = figuri[figuri.length - 1];
      const option = listaFiguri.appendChild(document.createElement("option"));
      option.setAttribute("figuriIndex", figuri.length - 1);
      switch (last.constructor.name) {
        case "Elipsa":
          option.textContent = `Elipsa ${++NR_ELIPSE}`;
          break;
        case "Dreptunghi":
          option.textContent = `Dreptunghi ${++NR_DREPTUNGHIURI}`;
          break;
        case "Linie":
          option.textContent = `Linie ${++NR_LINII}`;
          break;
      }
    }
  }
};

listaFiguri.onchange = (e) => {
  indexFig =
    e.target.options[e.target.selectedIndex].getAttribute("figuriIndex");
};

const updateIndexes = (options) => {
  for (const option of options) {
    const index = option.getAttribute("figuriIndex");
    if (index > indexFig) {
      option.setAttribute("figuriIndex", index - 1);
    }
  }
};

listaFiguri.onkeydown = (e) => {
  if (indexFig === null) return;
  let modificat = false;
  if (e.keyCode === 46) {
    figuri.splice(indexFig, 1);
    updateIndexes(listaFiguri.children);
    listaFiguri.removeChild(listaFiguri.children[indexFig]);
    if (listaFiguri.children.length === 0) {
      placeholderLbl.removeAttribute("hidden");
      listaFiguri.setAttribute("hidden", true);
      NR_DREPTUNGHIURI = NR_ELIPSE = NR_LINII = 0;
    }
    indexFig = null;
    modificat = true;
  } else if (e.keyCode === 69) {
    const figura = figuri[indexFig];
    const figuraNume = figura.constructor.name;
    switch (figuraNume) {
      case "Elipsa":
        const x = prompt(
          `Introduceti noua valoare pentru x (valoare veche: ${figura.x}):`
        );
        let tmp = parseInt(x);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0 || tmp > canvas.width) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv mai mic decât lățimea canvas-ului!"
          );
          return;
        }
        if (tmp !== figura.x) {
          figura.x = tmp;
          modificat = true;
        }
        const y = prompt(
          `Introduceti noua valoare pentru y (valoare veche: ${figura.y}):`
        );
        tmp = parseInt(y);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0 || tmp > canvas.height) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv mai mic decât înălțimea canvas-ului!"
          );
          return;
        }
        if (tmp !== figura.y) {
          figura.y = tmp;
          modificat = true;
        }
        const razaX = prompt(
          `Introduceti noua valoare pentru razaX (valoare veche: ${figura.razaX}):`
        );
        tmp = parseInt(razaX);
        if (isNaN(tmp)) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp < 0) {
          alert(
            "Valoare invalidă! Noua razăX trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp !== figura.razaX) {
          figura.razaX = tmp;
          modificat = true;
        }
        const razaY = prompt(
          `Introduceti noua valoare pentru razaY (valoare veche: ${figura.razaY}):`
        );
        tmp = parseInt(razaY);
        if (isNaN(tmp)) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp < 0) {
          alert(
            "Valoare invalidă! Noua razăY trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp !== figura.razaY) {
          figura.razaY = tmp;
          modificat = true;
        }
        break;
      case "Dreptunghi":
        const xx = prompt(
          `Introduceti noua valoare pentru x (valoare veche: ${figura.x}):`
        );
        tmp = parseInt(xx);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp !== figura.x) {
          figura.x = tmp;
          modificat = true;
        }
        const yy = prompt(
          `Introduceti noua valoare pentru y (valoare veche: ${figura.y}):`
        );
        tmp = parseInt(yy);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv!"
          );
          return;
        }
        if (tmp !== figura.y) {
          figura.y = tmp;
          modificat = true;
        }
        const latime = prompt(
          `Introduceti noua valoare pentru latime (valoare veche: ${figura.latime}):`
        );
        tmp = parseInt(latime);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp !== figura.latime) {
          figura.latime = tmp;
          modificat = true;
        }
        const inaltime = prompt(
          `Introduceti noua valoare pentru inaltime (valoare veche: ${figura.inaltime}):`
        );
        tmp = parseInt(inaltime);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp !== figura.inaltime) {
          figura.inaltime = tmp;
          modificat = true;
        }
        break;
      case "Linie":
        const x1 = prompt("Introduceti noua valoare pentru x1:");
        tmp = parseInt(x1);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0 || tmp > canvas.width) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv mai mic decât lățimea canvas-ului!"
          );
          return;
        }
        if (tmp !== figura.x1) {
          figura.x1 = tmp;
          modificat = true;
        }
        const y1 = prompt("Introduceti noua valoare pentru y1:");
        tmp = parseInt(y1);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp < 0 || tmp > canvas.height) {
          alert(
            "Valoare invalidă! Noua valoare trebuie să fie un număr pozitiv mai mic decât înălțimea canvas-ului!"
          );
          return;
        }
        if (tmp !== figura.y1) {
          figura.y1 = tmp;
          modificat = true;
        }
        const x2 = prompt("Introduceti noua valoare pentru x2:");
        tmp = parseInt(x2);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp !== figura.x2) {
          figura.x2 = tmp;
          modificat = true;
        }
        const y2 = prompt("Introduceti noua valoare pentru y2:");
        tmp = parseInt(y2);
        if (isNaN(tmp)) {
          alert("Valoare invalidă!");
          return;
        }
        if (tmp !== figura.y2) {
          figura.y2 = tmp;
          modificat = true;
        }
        break;
      default:
        break;
    }
  }
  if (modificat) {
    clearCanvas();
    ctx.fillStyle = cpBgCanvas.value;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    figuri.forEach((figura) => figura.deseneaza());
  }
};

canvas.onmouseleave = () => {
  canvas.style.cursor = "auto";
};

canvas.oncontextmenu = (e) => {
  e.preventDefault();
};

cpBgCanvas.oninput = (e) => {
  clearCanvas();
  ctx.fillStyle = e.target.value;
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
  figuri.forEach((figura) => figura.deseneaza());
};

cpLineColor.oninput = (e) => {
  currentTool.lineColor = e.target.value;
};

cpFillColor.oninput = (e) => {
  currentTool.fillColor = e.target.value;
};

thicknessSlider.oninput = (e) => {
  currentTool.size = e.target.value;
  thicknessValue.textContent = e.target.value;
};

clearBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = cpBgCanvas.value;
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
  figuri.length = 0;
  listaFiguri.replaceChildren();
  listaFiguri.setAttribute("hidden", true);
  placeholderLbl.removeAttribute("hidden");
  NR_ELIPSE = NR_DREPTUNGHIURI = NR_LINII = 0;
};

transparencyCb.onchange = () => {
  if (transparencyCb.checked) {
    ctx.globalAlpha = 0.5;
  } else {
    ctx.globalAlpha = 1;
  }
  clearCanvas();
  ctx.fillStyle = cpBgCanvas.value;
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
  figuri.forEach((figura) => figura.deseneaza());
};

// funcția de salvare raster a imaginii
saveBtn.onclick = () => {
  // întreabă utilizatorul ce nume să aibă fișierul salvat
  const numeFisier = prompt("Numele imaginii:");
  if (numeFisier.length === 0) {
    alert("Numele imaginii nu poate fi vid!");
    return;
  }
  // întreabă utilizatorul ce format de imagine dorește
  let format = prompt("Formatul imaginii:");
  if (format.length === 0) {
    alert("Formatul imaginii nu poate fi vid!");
    return;
  }
  format = format.toLowerCase();
  const downloadObj = document.createElement("a");
  switch (format) {
    case "png":
      clearCanvas();
      figuri.forEach((figura) => figura.deseneaza());
      const PNGdata = canvas.toDataURL("image/png");
      downloadObj.href = PNGdata;
      downloadObj.download = numeFisier + ".png";
      break;
    case "jpeg":
      const JPEGdata = canvas.toDataURL("image/jpeg", 1.0);
      downloadObj.href = JPEGdata;
      downloadObj.download = numeFisier + ".jpeg";
      break;
    default:
      alert("Formatul imaginii nu este suportat!");
      return;
  }
  downloadObj.click();
};

// funcția de export SVG
exportSVGBtn.onclick = () => {
  // întreabă utilizatorul ce nume să aibă fișierul salvat
  const numeFisier = prompt("Numele imaginii:");
  if (numeFisier.length === 0) {
    alert("Numele imaginii nu poate fi vid!");
    return;
  }
  const downloadObj = document.createElement("a");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", canvas.width);
  svg.setAttribute("height", canvas.height);
  const imagine = new Image();
  imagine.src = canvas.toDataURL("image/png");
  const svgImg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  svgImg.setAttribute("width", canvas.width);
  svgImg.setAttribute("height", canvas.height);
  svgImg.setAttribute("x", 0);
  svgImg.setAttribute("y", 0);
  svgImg.setAttributeNS("http://www.w3.org/1999/xlink", "href", imagine.src);
  svg.appendChild(svgImg);
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  downloadObj.href = URL.createObjectURL(blob);
  downloadObj.download = numeFisier + ".svg";
  downloadObj.click();
};
