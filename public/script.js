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

window.onload = obtenerPrecioUdrea;
