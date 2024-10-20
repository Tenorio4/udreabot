async function obtenerPrecioUdrea() {
  try {
    const response = await fetch("/precio-actual");
    const data = await response.json();
    document.getElementById(
      "precio"
    ).textContent = `El precio de la udrea hoy está a ${data.precio}€ la unidad`;
  } catch (error) {
    document.getElementById("precio").textContent = "Error al cargar el precio";
  }
}

async function obtenerPrecioItem(item) {
  try {
    const response = await fetch(`${item}`);
    const data = await response.json();
    document.getElementById(
      `${item}`
    ).textContent = `Precio: ${data.precio} udrea(s)`;
  } catch (error) {
    document.getElementById(`${item}`).textContent =
      "Error al cargar el precio";
  }
}

async function obtenerRanking() {
  try {
    const response = await fetch("/ranking");
    const data = await response.json();

    const listaElement = document.getElementById("lista");

    // Limpia la lista antes de agregar datos
    listaElement.innerHTML = "";

    data.forEach((data) => {
      // Crear un nuevo elemento de lista <li>
      const li = document.createElement("li");
      li.textContent = `Usuario: ${data.username}, Porcentaje: ${data.porcentaje}%`;

      // Agregar el elemento a la lista
      listaElement.appendChild(li);
    });
  } catch (error) {
    document.getElementById("ranking").textContent =
      "Error al cargar el ranking";
  }
}

window.onload = obtenerPrecioItem("/reroll");
window.onload = obtenerPrecioItem("/heteropocion1");
window.onload = obtenerPrecioItem("/heteropocion2");
window.onload = obtenerPrecioItem("/heteropocion3");
window.onload = obtenerPrecioItem("/picaduradelacobragay");
//window.onload = obtenerRanking;
window.onload = obtenerPrecioUdrea;

/*const button = document.getElementById("close");
const videoIframe = document.getElementById("video-background");

button.addEventListener("click", function () {
  // Cambiar la URL del iframe para desactivar el mute y activar el sonido
  const videoSrc =
    "https://www.youtube.com/embed/QUcTsFe1PVs?autoplay=1&start=55&loop=1&playlist=QUcTsFe1PVs&controls=0&showinfo=0&modestbranding=1&mute=0";
  videoIframe.src = videoSrc;
});*/

// Cargar el menú de un archivo HTML externo
document.addEventListener("DOMContentLoaded", function () {
  fetch("menu.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("menu-lateral").innerHTML = data;

      $(".close").click(function () {
        $(".outside").toggleClass("in");
        $(".bar").toggleClass("active");
        $(this).toggleClass("is-showing");
      });
    });
});

/*
var canvas = document.createElement("canvas");
canvas.style.position = "absolute"; // Asegúrate de que el canvas esté posicionado absolutamente
canvas.style.top = "0"; // Alineado al top
canvas.style.left = "0"; // Alineado a la izquierda
canvas.width = window.innerWidth; // Establecer el ancho del canvas
canvas.height = window.innerHeight; // Establecer la altura del canvas
canvas.style.width = "100%"; // Ocupa el 100% del ancho de la ventana
canvas.style.height = "100%"; // Ocupa el 100% de la altura de la ventana
document.body.appendChild(canvas);
var gl = canvas.getContext("webgl");

canvas.width = window.innerWidth; // Establecer el ancho del canvas
canvas.height = window.innerHeight; // Establecer la altura del canvas

var mouse = { x: 0, y: 0 };

var numMetaballs = 30;
var metaballs = [];
var width = (canvas.width = window.innerWidth * 0.75);
var height = (canvas.height = window.innerHeight * 0.75);
for (var i = 0; i < numMetaballs; i++) {
  var radius = Math.random() * 30 + 10;
  metaballs.push({
    x: Math.random() * (width - 2 * radius) + radius,
    y: Math.random() * (height - 2 * radius) + radius,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    r: radius * 0.75,
  });
}

var vertexShaderSrc = `
attribute vec2 position;

void main() {
// position specifies only x and y.
// We set z to be 0.0, and w to be 1.0
gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentShaderSrc =
  `
precision highp float;

const float WIDTH = ` +
  (width >> 0) +
  `.0;
const float HEIGHT = ` +
  (height >> 0) +
  `.0;

uniform vec3 metaballs[` +
  numMetaballs +
  `];

void main(){
float x = gl_FragCoord.x;
float y = gl_FragCoord.y;

float sum = 0.0;
for (int i = 0; i < ` +
  numMetaballs +
  `; i++) {
vec3 metaball = metaballs[i];
float dx = metaball.x - x;
float dy = metaball.y - y;
float radius = metaball.z;

sum += (radius * radius) / (dx * dx + dy * dy);
}

if (sum >= 0.99) {
gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
return;
}

gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}

`;

var vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var vertexData = new Float32Array([
  -1.0,
  1.0, // top left
  -1.0,
  -1.0, // bottom left
  1.0,
  1.0, // top right
  1.0,
  -1.0, // bottom right
]);
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

var positionHandle = getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(
  positionHandle,
  2, // position is a vec2
  gl.FLOAT, // each component is a float
  gl.FALSE, // don't normalize values
  2 * 4, // two 4 byte float components per vertex
  0 // offset into each span of vertex data
);

var metaballsHandle = getUniformLocation(program, "metaballs");

loop();
function loop() {
  for (var i = 0; i < numMetaballs; i++) {
    var metaball = metaballs[i];
    metaball.x += metaball.vx;
    metaball.y += metaball.vy;

    if (metaball.x < metaball.r || metaball.x > width - metaball.r)
      metaball.vx *= -1;
    if (metaball.y < metaball.r || metaball.y > height - metaball.r)
      metaball.vy *= -1;
  }

  var dataToSendToGPU = new Float32Array(3 * numMetaballs);
  for (var i = 0; i < numMetaballs; i++) {
    var baseIndex = 3 * i;
    var mb = metaballs[i];
    dataToSendToGPU[baseIndex + 0] = mb.x;
    dataToSendToGPU[baseIndex + 1] = mb.y;
    dataToSendToGPU[baseIndex + 2] = mb.r;
  }
  gl.uniform3fv(metaballsHandle, dataToSendToGPU);

  //Draw
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(loop);
}

function compileShader(shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }

  return shader;
}

function getUniformLocation(program, name) {
  var uniformLocation = gl.getUniformLocation(program, name);
  if (uniformLocation === -1) {
    throw "Can not find uniform " + name + ".";
  }
  return uniformLocation;
}

function getAttribLocation(program, name) {
  var attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation === -1) {
    throw "Can not find attribute " + name + ".";
  }
  return attributeLocation;
}

canvas.onmousemove = function (e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
};*/
