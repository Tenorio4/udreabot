const express = require("express");
const { Telegraf } = require("telegraf");
const admin = require("firebase-admin");
const schedule = require("node-schedule"); // Librería para programación de tareas
const moment = require("moment-timezone"); // Para manejo de zona horaria
const axios = require("axios"); // Para memes

const app = express();
// Página web
const path = require("path");
const port = process.env.PORT || 3000; // Puerto configurado por Render

// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal para servir un archivo HTML estático
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor web corriendo en el puerto ${port}`);
});

app.get("/precio-actual", async (req, res) => {
  try {
    const precioDoc = await db.collection("precios").doc("precioActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.precio) {
      res.json({ precio: precioData.precio });
    } else {
      res.status(404).send("No se encontró el precio para hoy.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/reroll", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.reroll) {
      res.json({ precio: precioData.reroll });
    } else {
      res.status(404).send("No se encontró el precio para reroll.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/heteropocion1", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.heteropocion1) {
      res.json({ precio: precioData.heteropocion1 });
    } else {
      res.status(404).send("No se encontró el precio para heteropocion1.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/heteropocion2", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.heteropocion2) {
      res.json({ precio: precioData.heteropocion2 });
    } else {
      res.status(404).send("No se encontró el precio para heteropocion2.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/heteropocion3", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.heteropocion3) {
      res.json({ precio: precioData.heteropocion3 });
    } else {
      res.status(404).send("No se encontró el precio para heteropocion3.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/picaduradelacobragay", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.picaduradelacobragay) {
      res.json({ precio: precioData.picaduradelacobragay });
    } else {
      res
        .status(404)
        .send("No se encontró el precio para picaduradelacobragay.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/superpicaduradelacobragay", async (req, res) => {
  try {
    const precioDoc = await db.collection("mercado").doc("mercadoActual").get();
    const precioData = precioDoc.data();

    if (precioData && precioData.superpicaduradelacobragay) {
      res.json({ precio: precioData.superpicaduradelacobragay });
    } else {
      res
        .status(404)
        .send("No se encontró el precio para picaduradelacobragay.");
    }
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/ranking", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        ranking.push({
          icono: null,
          username: data.username,
          porcentaje: data.porcentaje,
        });
      }
    });

    ranking.sort((a, b) => b.porcentaje - a.porcentaje); // Ordenar por porcentaje descendente

    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (index != 0 && user.porcentaje != ranking[index - 1].porcentaje)
        x += 1;
      icono = posiciones[x];

      ranking[index].icono = icono;
    });

    if (ranking.length > 0) res.json(ranking);
    else res.json("Ahora mismo solo hay cobardes");
  } catch (error) {
    console.error("Error al obtener el ranking:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/rankingmensual", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.puntosMensuales !== null) {
        ranking.push({
          icono: null,
          username: data.username,
          puntos: data.puntosMensuales,
        });
      }
    });

    ranking.sort((a, b) => b.puntos - a.puntos);

    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (index != 0 && user.puntos != ranking[index - 1].puntos) x += 1;
      icono = posiciones[x];

      ranking[index].icono = icono;
    });

    if (ranking.length > 0) res.json(ranking);
    else res.json("Ahora mismo no hay datos");
  } catch (error) {
    console.error("Error al obtener el ranking mensual:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/rankinganual", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.puntosAnuales !== null) {
        ranking.push({
          icono: null,
          username: data.username,
          puntos: data.puntosAnuales,
        });
      }
    });

    ranking.sort((a, b) => b.puntos - a.puntos);

    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (index != 0 && user.puntos != ranking[index - 1].puntos) x += 1;
      icono = posiciones[x];

      ranking[index].icono = icono;
    });

    if (ranking.length > 0) res.json(ranking);
    else res.json("Ahora mismo no hay datos");
  } catch (error) {
    console.error("Error al obtener el ranking anual:", error);
    res.status(500).send("Error en el servidor");
  }
});

const bot = new Telegraf(process.env.BOT_TOKEN);
// Configurar la zona horaria
const TIMEZONE = "Europe/Madrid";

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});
const db = admin.firestore();

// Comando para registrar un grupo y guardar su chat_id
bot.command("registrargrupo", async (ctx) => {
  if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    const groupId = ctx.chat.id.toString(); // Obtener el chat_id del grupo

    try {
      await db.collection("config").doc("grupo").set({ groupId }); // Guardar el chat_id en Firestore
      ctx.reply("Udrea!");
    } catch (error) {
      console.error("Error registrando el grupo:", error);
      ctx.reply("Hubo un error al registrar el grupo.");
    }
  } else {
    ctx.reply("Este comando solo puede usarse en grupos.");
  }
});

// Lista de usuarios definidos
const usuarios = [
  "@TenorioSRG",
  "@HooksLasVegas",
  "@Pmoai",
  "@ireeneeri",
  "@RangoLV",
  "@Chewyck",
  "@Papadopoulos",
  "@Numuhukumakiakiaialunamor",
];

function getNombre(username) {
  switch (username) {
    case "@TenorioSRG":
      return "Sergio";
      break;
    case "@HooksLasVegas":
      return "Fran";
      break;
    case "@Pmoai":
      return "Pedro Parrado";
      break;
    case "@ireeneeri":
      return "Irene";
      break;
    case "@RangoLV":
      return "Antonio";
      break;
    case "@Chewyck":
      return "José Guillén";
      break;
    case "@Papadopoulos":
      return "Dani";
      break;
    case "@Numuhukumakiakiaialunamor":
      return "Cuque";
      break;
    default:
      return "";
      break;
  }
}

// Inicializar datos de usuarios en Firestore
async function inicializarUsuarios() {
  try {
    const batch = db.batch();
    usuarios.forEach((username) => {
      const userDoc = db.collection("usuarios").doc(username);
      batch.set(userDoc, {
        username: username,
        porcentaje: null,
        puntos: 0,
        puntosMensuales: 0,
        puntosAnuales: 0,
        ultimaActualizacion: null,
      });
    });
    await batch.commit();
    console.log("Usuarios inicializados en la base de datos.");
  } catch (error) {
    console.error("Error inicializando usuarios:", error);
  }
}

// Registrar comandos
bot.telegram.setMyCommands([
  { command: "/start", description: "Inicia el bot" },
  { command: "/help", description: "Muestra la ayuda" },
  { command: "/web", description: "Muestra la web de UdreaBot" },
  { command: "/nivel", description: "Muestra tu vasto incremento" },
  { command: "/desempatar", description: "Para desempatar" },
  { command: "/ranking", description: "Muestra el ranking del día" },
  { command: "/rankingmensual", description: "Muestra el ranking del mes" },
  { command: "/rankinganual", description: "Muestra el ranking del año" },
  { command: "/quiendeaqui", description: "Muestra quién de aquí" },
  { command: "/cobardes", description: "Muestra a los cobardes del día" },
  { command: "/precio", description: "Muestra el precio actual" },
  { command: "/comprar", description: "Para comprar" },
  { command: "/vender", description: "Para vender" },
  { command: "/mercado", description: "Muestra el mercado actual" },
  { command: "/reroll", description: "Para hacer otra tirada de nivel" },
  { command: "/heteropocion1", description: "Para bajar tu vasto incremento" },
  {
    command: "/picaduradelacobragay",
    description: "Para convertir en gay a otro usuario",
  },
  { command: "/cobra", description: "Para convertir en gay a otro usuario" },
  {
    command: "/superpicaduradelacobragay",
    description: "Para convertir en gay a los demás usuarios",
  },
  {
    command: "/supercobra",
    description: "Para convertir en gay a los demás usuarios",
  },
  { command: "/balance", description: "Muestra tus dineros y tus udreas" },
  { command: "/udrea", description: "Udrea" },
  { command: "/superudrea", description: "Para superudrear" },
  { command: "/a", description: "aaaAAaaaAAAaaaAaaAAAaHhh" },
  { command: "/utsu", description: "utsuuuuraleeaa" },
  { command: "/s", description: "Para suponer" },
  { command: "/c", description: "Claro" },
  { command: "/p", description: "Lo peor" },
  { command: "/m", description: "Para audio aleatorio graciosísimo" },
  { command: "/meme", description: "Muestra un meme aleatorio" },
]);

//inicializarUsuarios(); // Llamar una vez al inicio

// Ruta de ping
app.get("/ping", (req, res) => {
  res.send("Bot is running");
});

// Comando /start
bot.start((ctx) => ctx.reply("muy bien"));

// Comando /help
bot.help((ctx) => ctx.reply("jajajajjajjaajaj"));

// Comando para devolver la Web
bot.command("web", async (ctx) => {
  ctx.reply("https://udreabot.onrender.com/");
});

// Función para obtener un porcentaje "aleatorio"
function obtenerPorcentajeAleatorio() {
  if (Math.random() <= 0.1) {
    // 10% de probabilidad
    if (Math.random() <= 0.01)
      // 10% * 1% de probabilidad
      return 1000000;
    return 100;
  } else {
    return Math.floor(Math.random() * 100); // 85% de probabilidad de devolver un número entre 0 y 99
  }
}

// Obtener la fecha de hoy en formato 'YYYY-MM-DD'
function obtenerFechaHoy() {
  return moment().tz(TIMEZONE).format("YYYY-MM-DD");
}

// Función para manejar el comando 'nivel'
async function nivel(username, ctx) {
  const today = obtenerFechaHoy();

  try {
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();

    if (
      userData &&
      userData.ultimaActualizacion === today &&
      !(userData.porcentaje === null)
    ) {
      if (userData.porcentaje == 100) {
        await ctx.reply(
          `Que sí que sí\n🏳️‍🌈${username}🏳️‍🌈 que tienes un ${userData.porcentaje}% de vasto incremento`
        );
      } else if (userData.porcentaje == 1000000) {
        await ctx.reply(
          `Que sí que sí\n🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈\n${username} QUE TIENES UN VASTO INCREMENTO DEL 1.000.000%\n🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈`
        );
      } else {
        ctx.reply(
          `${username} ya te he dicho que tienes un ${userData.porcentaje}% de vasto incremento`
        );
      }
    } else {
      const nuevoPorcentaje = obtenerPorcentajeAleatorio();
      await userDoc.set({
        ...userData,
        porcentaje: nuevoPorcentaje,
        ultimaActualizacion: today,
      });
      if (nuevoPorcentaje == 0) {
        await ctx.reply(
          `${username} tiene un ${nuevoPorcentaje}% de vasto incremento`
        );
        await ctx.reply(`Disfruta de tu heterosexualidad!`);
        await ctx.reply("(mientras dure)");
        await ctx.reply("Udrea!");
      } else if (nuevoPorcentaje == 100) {
        await ctx.reply(
          `🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈\n${username} tiene un vasto incremento del ${nuevoPorcentaje}% \n🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈`
        );
      } else if (nuevoPorcentaje == 1000000) {
        await ctx.reply(`🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈`);
        await ctx.reply(
          `🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈\n${username} TIENE UN VASTO INCREMENTO DEL 1.000.000%\n🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈`
        );
        await ctx.reply(`🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈🏳️‍🌈`);
        sumarPuntosAGanador(username);
        await ctx.reply(
          `Se le ha sumado un punto más a ${username} en el ranking mensual`
        );
      } else {
        await ctx.reply(
          `${username} tiene un ${nuevoPorcentaje}% de vasto incremento`
        );
      }
    }
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    ctx.reply("Hubo un error al calcular tu nivel.");
  }
}

// Comando para manejar el comando 'nivel'
bot.command("nivel", async (ctx) => {
  const username = `@${ctx.from.username}`;
  nivel(username, ctx);
});

// Desempatar
bot.command("desempatar", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const usuarios = await db.collection("usuarios").get();
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    let ultimaTirada = true;
    let empatados = [];
    usuarios.forEach((doc) => {
      const data = doc.data();
      if (
        username !== data.username &&
        userData.porcentaje === data.porcentaje
      ) {
        empatados.push({
          username: data.username,
          porcentaje: data.porcentaje,
          desempate: data.desempate,
        });
        if (data.desempate == null) ultimaTirada = false;
      }
    });

    if (empatados.length > 0 && userData.desempate == null) {
      const resultado = Math.floor(Math.random() * 11); // Entre 0 y 10
      await userDoc.update({
        desempate: resultado,
      });
      await ctx.reply(`${username} has sacado un ${resultado}`);

      // Comprobar los desempates
      if (ultimaTirada) {
        empatados.push({
          username: username,
          porcentaje: userData.porcentaje,
          desempate: resultado,
        });
        const maxTirada = Math.max(...empatados.map((user) => user.desempate));
        const ganadoresTirada = empatados.filter(
          (user) => user.desempate === maxTirada
        );
        if (ganadoresTirada.length == 1) {
          const userGanadorDoc = db
            .collection("usuarios")
            .doc(ganadoresTirada[0].username);
          await userGanadorDoc.update({
            porcentaje:
              ganadoresTirada[0].porcentaje - ganadoresTirada[0].desempate,
            desempate: null,
          });
          empatados.forEach((empatado) => {
            if (ganadoresTirada[0].username !== empatado.username) {
              let userPerdedorDoc = db
                .collection("usuarios")
                .doc(empatado.username);
              userPerdedorDoc.update({
                desempate: null,
              });
            }
          });
          const ganadorData = (await userGanadorDoc.get()).data();
          const anteriorPorcentaje = ganadorData.porcentaje + maxTirada;
          await ctx.reply(
            `${ganadorData.username} ha ganado el desempate y su vasto incremento se ha reducido en un ${maxTirada}%:\n(${anteriorPorcentaje}% => ${ganadorData.porcentaje}%)`
          );
        } else {
          empatados.forEach((empatado) => {
            let userEmpatadoDoc = db
              .collection("usuarios")
              .doc(empatado.username);
            userEmpatadoDoc.update({
              desempate: null,
            });
          });
          await ctx.reply("Empate en el desempate, qué ironía");
          await ctx.reply("Pulse aquí -> /desempatar para intentarlo de nuevo");
        }
      }
    } else if (userData.desempate !== null) {
      await ctx.reply(
        `${username} ya te he dicho que has sacado un ${userData.desempate}`
      );
    } else {
      await ctx.reply("No has empatado con nadie, tonto");
    }
  } catch (error) {
    console.error("Error al desempatar:", error);
    await ctx.reply("Udrea!");
  }
});

// Comando /ranking para mostrar el ranking del día
bot.command("ranking", async (ctx) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        ranking.push({ username: data.username, porcentaje: data.porcentaje });
      }
    });

    ranking.sort((a, b) => b.porcentaje - a.porcentaje); // Ordenar por porcentaje descendente

    let rankingMensaje = "🏆 Ranking del día 🏆 \n\n";
    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (index != 0 && user.porcentaje != ranking[index - 1].porcentaje)
        x += 1;
      icono = posiciones[x];

      rankingMensaje += `${icono} ${getNombre(user.username)}: ${
        user.porcentaje
      }%\n`;
    });

    if (ranking.length > 0) ctx.reply(rankingMensaje);
    else ctx.reply("Ahora mismo solo hay cobardes");
  } catch (error) {
    console.error("Error obteniendo el ranking:", error);
    ctx.reply("Hubo un error al obtener el ranking.");
  }
});

// Comando /rankingdelmes para mostrar el ranking del mes
bot.command("rankingmensual", async (ctx) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.puntosMensuales !== null) {
        ranking.push({
          username: data.username,
          puntosMensuales: data.puntosMensuales,
        });
      }
    });

    ranking.sort((a, b) => b.puntosMensuales - a.puntosMensuales); // Ordenar por porcentaje descendente

    let rankingMensaje = "🏆 Ranking del mes 🏆 \n\n";
    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (
        index != 0 &&
        user.puntosMensuales != ranking[index - 1].puntosMensuales
      )
        x += 1;
      icono = posiciones[x];

      rankingMensaje += `${icono} ${getNombre(user.username)}: ${
        user.puntosMensuales
      }\n`;
    });
    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error("Error obteniendo el ranking:", error);
    ctx.reply("Hubo un error al obtener el ranking.");
  }
});

// Comando /rankingdelaño para mostrar el ranking del año
bot.command("rankinganual", async (ctx) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.puntosAnuales !== null) {
        ranking.push({
          username: data.username,
          puntosAnuales: data.puntosAnuales,
        });
      }
    });

    ranking.sort((a, b) => b.puntosAnuales - a.puntosAnuales); // Ordenar por porcentaje descendente

    let rankingMensaje = "🏆 Ranking del año 🏆 \n\n";
    let icono = "";
    let x = 0;
    ranking.forEach((user, index) => {
      let posiciones = ["🥇", "🥈", "🥉", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "];

      if (index != 0 && user.puntosAnuales != ranking[index - 1].puntosAnuales)
        x += 1;
      icono = posiciones[x];

      rankingMensaje += `${icono} ${getNombre(user.username)}: ${
        user.puntosAnuales
      }\n`;
    });
    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error("Error obteniendo el ranking:", error);
    ctx.reply("Hubo un error al obtener el ranking.");
  }
});

// Comando /cobardes para mostrar a los cobardes del día
bot.command("cobardes", async (ctx) => {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    let cobardes = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje == null) {
        cobardes.push({ username: data.username });
      }
    });

    if (cobardes.length === 0) {
      await ctx.reply("Parece que no hay cobardes hoy");
    } else if (cobardes.length === 1) {
      if (cobardes[0].username === "@ireeneeri")
        ctx.reply(`${cobardes[0].username} es una cobarde`);
      else ctx.reply(`${cobardes[0].username} es un cobarde`);
    } else {
      let cobardesMensaje = "Estos son los cobardes:\n\n";
      cobardes.forEach((user, index) => {
        cobardesMensaje += `· ${user.username}\n`;
      });

      await ctx.reply(cobardesMensaje);
    }
  } catch (error) {
    console.error("Error obteniendo a los cobardes:", error);
    ctx.reply("Hubo un error al obtener los cobardes");
  }
});

// Función para manejar "quien de aqui"
bot.hears(
  /quien\s*de\s*aqui|quién\s*de\s*aquí|quién\s*de\s*aqui|quien\s*de\s*aquí|quiendeaqui|Quiendeaqui/i,
  async (ctx) => {
    const today = obtenerFechaHoy();
    try {
      const usersSnapshot = await db.collection("usuarios").get();
      let ranking = [];
      let cobardes = [];

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.porcentaje !== null) {
          ranking.push({
            username: data.username,
            porcentaje: data.porcentaje,
          });
        } else {
          cobardes.push(data.username);
        }
      });

      if (ranking.length === usuarios.length) {
        const maxPorcentaje = Math.max(
          ...ranking.map((user) => user.porcentaje)
        );
        const ganadores = ranking.filter(
          (user) => user.porcentaje === maxPorcentaje
        );

        if (ganadores.length === 1) {
          if (ganadores[0].username === "@ireeneeri")
            await ctx.reply(
              `${ganadores[0].username} es la más homo con un vasto incremento del ${ganadores[0].porcentaje}%`
            );
          else
            await ctx.reply(
              `${ganadores[0].username} es el más homo con un vasto incremento del ${ganadores[0].porcentaje}%`
            );
        } else {
          let ganadoresMensaje = `Los homos del día son:\n\n`;
          ganadores.forEach((user, index) => {
            ganadoresMensaje += `· ${user.username}\n`;
          });
          ganadoresMensaje += `\nTodos con un vasto incremento del ${ganadores[0].porcentaje}%`;
          await ctx.reply(ganadoresMensaje);
        }
      } else {
        if (cobardes.length > 0) {
          const cobardeElegido =
            cobardes[Math.floor(Math.random() * cobardes.length)];
          await ctx.reply(
            `Aún no dispongo de los datos suficientes pero puedo afirmar que ${cobardeElegido} es un cobarde y por tanto un homo`
          );
          await ctx.reply(
            "Pulse aquí -> /cobardes para ver quiénes son los cobardes"
          );
        } else {
          ctx.reply("Parece que todos han hecho su tirada de nivel.");
        }
      }
    } catch (error) {
      console.error('Error en "quien de aqui":', error);
      ctx.reply("José Guillén");
    }
  }
);

// Expresión regular para capturar palabras derivadas de "udrea"
const udreaRegex = /\budrea(a|aa|aaa|aaaa|aaaaa|s|ría|ríe|)\b/i;

// Listener para palabras derivadas de "udrea" o el comando /udrea
/*bot.hears(udreaRegex, async (ctx) => {
  await enviarMensajeAleatorio(ctx, "udreaMessages");
});*/

bot.command("udrea", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "udreaMessages");
});

bot.command("a", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "a");
});

bot.command("utsu", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "utsu");
});

bot.command("s", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "suponia");
});

bot.command("p", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "peor");
});

bot.command("c", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "claro");
});
bot.command("superudrea", async (ctx) => {
  for (let i = 0; i < 11; i++) {
    enviarMensajeAleatorio(ctx, "udreaMessages");
  }
});
bot.command("m", async (ctx) => {
  await enviarMensajeAleatorio(ctx, "mMessages");
});

// Regex para detectar palabras que terminan en "ano"
const regexAno = /ano[\.\b]*$/i;
bot.hears(regexAno, async (ctx) => {
  // Responde citando el mensaje original
  ctx.reply("Pues me la agarras con la mano", {
    reply_to_message_id: ctx.message.message_id,
  });
});

// Regex para detectar palabras que terminan en "inco o 5"
const regexInco = /(inco|5)\.?\b$/i;
bot.hears(regexInco, async (ctx) => {
  // Responde citando el mensaje original
  ctx.reply("Pues por el culo te la hinco", {
    reply_to_message_id: ctx.message.message_id,
  });
});

// Función para enviar un mensaje aleatorio de la colección "udreaMessages" en Firestore
async function enviarMensajeAleatorio(ctx, coleccion) {
  try {
    const messagesSnapshot = await db.collection(coleccion).get();
    if (messagesSnapshot.empty) {
      ctx.reply("Udrea!");
      return;
    }

    // Obtener un mensaje aleatorio
    const mensajes = messagesSnapshot.docs.map((doc) => doc.data());
    const mensajeAleatorio =
      mensajes[Math.floor(Math.random() * mensajes.length)];

    // Enviar el mensaje aleatorio según su tipo
    switch (mensajeAleatorio.type) {
      case "text":
        await ctx.reply(mensajeAleatorio.content);
        break;
      case "photo":
        await ctx.replyWithPhoto(mensajeAleatorio.content);
        break;
      case "animation":
        await ctx.replyWithAnimation(mensajeAleatorio.content);
        break;
      case "sticker":
        await ctx.replyWithSticker(mensajeAleatorio.content);
        break;
      case "voice":
        await ctx.replyWithVoice(mensajeAleatorio.content);
        break;
      default:
        console.log("Tipo de mensaje no soportado:", mensajeAleatorio.type);
    }
  } catch (error) {
    console.error("Error enviando mensaje aleatorio:", error);
    ctx.reply("Udrea!");
  }
}

// Función para obtener un precio aleatorio entre 0.01€ y 4.99€
function obtenerPrecioAleatorio() {
  return (Math.random() * (4.99 - 0.5) + 0.5).toFixed(2); // Devuelve un número con 2 decimales
}

// Comando /precio
bot.command("precio", async (ctx) => {
  const today = obtenerFechaHoy();

  try {
    // Siempre usa un único documento para guardar el precio y la fecha
    const precioDoc = db.collection("precios").doc("precioActual");
    const precioData = (await precioDoc.get()).data();

    if (precioData && precioData.fecha === today) {
      // Si ya existe un precio para hoy, lo mostramos
      ctx.reply(
        `El precio de la udrea hoy está a ${precioData.precio}€ la unidad`
      );
    } else {
      // Si no existe un precio para hoy, generamos uno nuevo y actualizamos el documento
      const nuevoPrecio = obtenerPrecioAleatorio();
      await precioDoc.set({
        precio: nuevoPrecio,
        fecha: today,
      });
      ctx.reply(`El precio de la udrea hoy está a ${nuevoPrecio}€ la unidad`);
    }
  } catch (error) {
    console.error("Error al guardar el precio en Firestore:", error);
    ctx.reply("Lo siento, se nos han acabado las udreas. Vuelva otro día");
  }
});

bot.command("vender", async (ctx) => {
  try {
    const today = obtenerFechaHoy();
    const precioDoc = db.collection("precios").doc("precioActual");
    const precioData = (await precioDoc.get()).data();
    if (precioData && precioData.fecha === today) {
      // Extraer el parámetro después del comando
      const messageText = ctx.message.text; // El texto completo del mensaje
      const params = messageText.split(" "); // Dividimos el texto en partes por espacio

      if (params.length < 2 || isNaN(params[1])) {
        // Si no se especificó un número o el parámetro no es válido
        return ctx.reply(
          "Las udreas se venden al 50% de su valor en el mercado.\nEspecifica cuantas quieres vender.\nEjemplo: /vender 2"
        );
      }

      const cantidad = parseInt(params[1]);

      // Ahora puedes usar la variable 'cantidad' en la lógica de venta
      if (cantidad <= 0) {
        return ctx.reply("Tú eres tonto");
      }

      const username = `@${ctx.from.username}`;
      const userDoc = db.collection("usuarios").doc(username);
      const userData = (await userDoc.get()).data();

      if (userData.udreas >= cantidad) {
        // Lógica para manejar la venta de la cantidad solicitada
        const nuevoDinero = (
          parseFloat(userData.dinero) +
          (parseFloat(precioData.precio) / 2) * cantidad
        ).toFixed(2);
        const nuevasUdreas = userData.udreas - cantidad;
        userDoc.set({
          ...userData,
          dinero: nuevoDinero,
          udreas: nuevasUdreas,
        });
        if (cantidad == 1)
          await ctx.reply(
            `Has vendido una udrea\nAhora tienes:\n\n· Dinero: ${nuevoDinero}€\n· Udreas: ${nuevasUdreas}`,
            {
              reply_to_message_id: ctx.message.message_id,
            }
          );
        else
          await ctx.reply(
            `Has vendido ${cantidad} udreas\nAhora tienes:\n\n· Dinero: ${nuevoDinero}€\n· Udreas: ${nuevasUdreas}`,
            {
              reply_to_message_id: ctx.message.message_id,
            }
          );
      } else {
        await ctx.reply(`No tienes udreas suficientes`, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    } else {
      await ctx.reply("No puedes vender a ciegas", {
        reply_to_message_id: ctx.message.message_id,
      });
      await ctx.reply("Pulse aquí -> /precio para consultar el precio de hoy");
      await ctx.reply("Y no seas un udrea");
    }
  } catch (error) {
    console.error("Error al vender:", error);
    await ctx.reply("Si alguien te vende udreas no le creas");
  }
});

bot.command("comprar", async (ctx) => {
  try {
    const today = obtenerFechaHoy();
    const precioDoc = db.collection("precios").doc("precioActual");
    const precioData = (await precioDoc.get()).data();
    if (precioData && precioData.fecha === today) {
      // Extraer el parámetro después del comando
      const messageText = ctx.message.text; // El texto completo del mensaje
      const params = messageText.split(" "); // Dividimos el texto en partes por espacio

      if (params.length < 2 || isNaN(params[1])) {
        // Si no se especificó un número o el parámetro no es válido
        return ctx.reply(
          "Especifica cuantas udreas quieres comprar.\nEjemplo: /comprar 2",
          {
            reply_to_message_id: ctx.message.message_id,
          }
        );
      }

      const cantidad = parseInt(params[1]);

      // Ahora puedes usar la variable 'cantidad' en la lógica de compra
      if (cantidad <= 0) {
        return ctx.reply("Tú eres tonto");
      }

      const username = `@${ctx.from.username}`;
      const userDoc = db.collection("usuarios").doc(username);
      const userData = (await userDoc.get()).data();

      if (userData.dinero >= precioData.precio * cantidad) {
        // Lógica para manejar la compra de la cantidad solicitada
        const nuevoDinero = (
          userData.dinero -
          precioData.precio * cantidad
        ).toFixed(2);
        const nuevasUdreas = userData.udreas + cantidad;
        userDoc.set({
          ...userData,
          dinero: nuevoDinero,
          udreas: nuevasUdreas,
        });
        if (cantidad == 1) {
          await ctx.reply(
            `Has comprado una udrea\nAhora tienes:\n\n· Dinero: ${nuevoDinero}€\n· Udreas: ${nuevasUdreas}`,
            {
              reply_to_message_id: ctx.message.message_id,
            }
          );
        } else {
          await ctx.reply(
            `Has comprado ${cantidad} udreas\nAhora tienes:\n\n· Dinero: ${nuevoDinero}€\n· Udreas: ${nuevasUdreas}`,
            {
              reply_to_message_id: ctx.message.message_id,
            }
          );
        }
      } else {
        await ctx.reply(`No hago tratos con pobres`, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    } else {
      await ctx.reply("No puedes comprar a ciegas", {
        reply_to_message_id: ctx.message.message_id,
      });
      await ctx.reply("Pulse aquí -> /precio para consultar el precio de hoy");
      await ctx.reply("Y no seas un udrea");
    }
  } catch (error) {
    console.error("Error al comprar:", error);
    await ctx.reply("Si alguien te vende udreas no le creas");
  }
});

bot.command("balance", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    let dinero = parseFloat(userData.dinero);
    dinero = dinero.toFixed(2);

    await ctx.reply(
      `${username} tienes:\n\n· Dinero: ${dinero}€\n· Udreas: ${userData.udreas}`
    );
  } catch (error) {
    console.error("Error en obtener balance:", error);
    await ctx.reply("Udrea!");
  }
});

bot.command("mercado", async (ctx) => {
  try {
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();

    let mercadoMensaje = `Mercado:\n\n`;
    mercadoMensaje += `· /reroll: ${mercadoData.reroll} udrea(s)\n`;
    mercadoMensaje += `· /heteropocion1: ${mercadoData.heteropocion1} udrea(s)\n`;
    mercadoMensaje += `· /heteropocion2: ${mercadoData.heteropocion2} udrea(s)\n`;
    mercadoMensaje += `· /heteropocion3: ${mercadoData.heteropocion3} udrea(s)\n`;
    mercadoMensaje += `· /picaduradelacobragay o /cobra: ${mercadoData.picaduradelacobragay} udrea(s)\n`;
    mercadoMensaje += `· /superpicaduradelacobragay o /supercobra: ${mercadoData.superpicaduradelacobragay} udrea(s)\n`;
    await ctx.reply(mercadoMensaje);
  } catch (error) {
    console.error("Error en obtener el mercado:", error);
    await ctx.reply("Udrea!");
  }
});

bot.command("reroll", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();

    if (userData.udreas >= mercadoData.reroll) {
      userDoc.update({
        porcentaje: null,
        ultimaActualizacion: null,
        udreas: userData.udreas - mercadoData.reroll,
      });
      await ctx.reply(`has usado reroll... 🔄`, {
        reply_to_message_id: ctx.message.message_id,
      });
      nivel(username, ctx);
    } else {
      await ctx.reply(`${username} no tienes udreas suficientes`);
    }
  } catch (error) {
    console.error("Error al hacer reroll:", error);
    await ctx.reply("Udrea!");
  }
});

bot.command("heteropocion1", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();
    const anteriorPorcentaje = userData.porcentaje;
    if (userData.udreas >= mercadoData.heteropocion1) {
      userDoc.update({
        porcentaje: userData.porcentaje - 10,
        udreas: userData.udreas - mercadoData.heteropocion1,
      });
      await ctx.reply(
        `${username} ha usado Hetero-poción LVL 1 🧪 y su vasto incremento ha disminuido en un 10%:\n(${anteriorPorcentaje}% => ${
          userData.porcentaje - 10
        }%)`
      );
    } else {
      await ctx.reply(`${username} no tienes udreas suficientes`);
    }
  } catch (error) {
    console.error("Error al hacer heteropocion1:", error);
    await ctx.reply("Udrea!");
  }
});

bot.command("heteropocion2", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();
    const anteriorPorcentaje = userData.porcentaje;
    if (userData.udreas >= mercadoData.heteropocion2) {
      userDoc.update({
        porcentaje: userData.porcentaje - 50,
        udreas: userData.udreas - mercadoData.heteropocion2,
      });
      await ctx.reply(
        `${username} ha usado Hetero-poción LVL 2 🧪y su vasto incremento ha disminuido en un 50%:\n(${anteriorPorcentaje}% => ${
          userData.porcentaje - 50
        }%)`
      );
    } else {
      await ctx.reply(`${username} no tienes udreas suficientes`);
    }
  } catch (error) {
    console.error("Error al hacer heteropocion2:", error);
    await ctx.reply("Udrea!");
  }
});

bot.command("heteropocion3", async (ctx) => {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();
    const anteriorPorcentaje = userData.porcentaje;
    if (userData.udreas >= mercadoData.heteropocion3) {
      userDoc.update({
        porcentaje: userData.porcentaje - 100,
        udreas: userData.udreas - mercadoData.heteropocion3,
      });
      await ctx.reply(
        `${username} ha usado Hetero-poción LVL 3 🧪 y su vasto incremento ha disminuido en un 100%:\n(${anteriorPorcentaje}% => ${
          userData.porcentaje - 100
        }%)`
      );
    } else {
      await ctx.reply(`${username} no tienes udreas suficientes`);
    }
  } catch (error) {
    console.error("Error al hacer heteropocion3:", error);
    await ctx.reply("Udrea!");
  }
});

async function picaduradelacobragay(ctx) {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();

    // Extraer el parámetro después del comando
    const messageText = ctx.message.text; // El texto completo del mensaje
    const params = messageText.split(" "); // Dividimos el texto en partes por espacio

    if (params.length < 2 || !usuarios.includes(params[1])) {
      // Si no se especificó un número o el parámetro no es válido
      return ctx.reply(
        "Especifica a quién quieres picar.\nEjemplo: /picaduradelacobragay @RangoLV"
      );
    }

    const victima = params[1];

    const usersSnapshot = await db.collection("usuarios").get();
    let lista = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        lista.push({ porcentaje: data.porcentaje });
      }
    });
    let maxPorcentaje = 0;
    maxPorcentaje = Math.max(...lista.map((user) => user.porcentaje));

    if (userData.porcentaje >= maxPorcentaje) {
      if (userData.udreas >= mercadoData.picaduradelacobragay) {
        const victimaDoc = db.collection("usuarios").doc(victima);
        const today = obtenerFechaHoy();
        victimaDoc.update({
          porcentaje: userData.porcentaje,
          ultimaActualizacion: today,
        });

        userDoc.update({
          udreas: userData.udreas - mercadoData.picaduradelacobragay,
        });
        await ctx.reply(`${username} ha picado a ${victima} 🐍`);
        await ctx.reply(
          `${victima} tiene ahora un vasto incremento del ${userData.porcentaje}%`
        );
      } else {
        await ctx.reply(`${username} no tienes udreas suficientes`);
      }
    } else {
      await ctx.reply(
        `${username} tienes que ser gay para poder picar a otro usuario`
      );
    }
  } catch (error) {
    console.error("Error al hacer picaduradelacobragay:", error);
    await ctx.reply("Udrea!");
  }
}

async function superpicaduradelacobragay(ctx) {
  try {
    const username = `@${ctx.from.username}`;
    const userDoc = db.collection("usuarios").doc(username);
    const userData = (await userDoc.get()).data();
    const mercadoDoc = db.collection("mercado").doc("mercadoActual");
    const mercadoData = (await mercadoDoc.get()).data();

    const usersSnapshot = await db.collection("usuarios").get();
    let lista = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        lista.push({ porcentaje: data.porcentaje });
      }
    });
    let maxPorcentaje = 0;
    maxPorcentaje = Math.max(...lista.map((user) => user.porcentaje));

    if (userData.porcentaje >= maxPorcentaje) {
      if (userData.udreas >= mercadoData.superpicaduradelacobragay) {
        const today = obtenerFechaHoy();
        let picados = "";
        usersSnapshot.forEach((doc) => {
          const victimaData = doc.data();
          const victimaDoc = db
            .collection("usuarios")
            .doc(victimaData.username);
          if (victimaData.username != userData.username) {
            victimaDoc.update({
              porcentaje: userData.porcentaje,
              ultimaActualizacion: today,
            });
            picados += `${victimaData.username} `;
          }
        });
        userDoc.update({
          udreas: userData.udreas - mercadoData.superpicaduradelacobragay,
        });
        await ctx.reply(`${username} ha picado a todos los usuarios 🐍`);
        await ctx.reply(
          `${picados}ahora tienen un vasto incremento del ${userData.porcentaje}%`
        );
      } else {
        await ctx.reply(`${username} no tienes udreas suficientes`);
      }
    } else {
      await ctx.reply(
        `${username} tienes que ser gay para poder picar a los demás usuarios`
      );
    }
  } catch (error) {
    console.error("Error al hacer superpicaduradelacobragay:", error);
    await ctx.reply("Udrea!");
  }
}

bot.command("picaduradelacobragay", async (ctx) => {
  picaduradelacobragay(ctx);
});

bot.command("cobra", async (ctx) => {
  picaduradelacobragay(ctx);
});

bot.command("superpicaduradelacobragay", async (ctx) => {
  superpicaduradelacobragay(ctx);
});

bot.command("supercobra", async (ctx) => {
  superpicaduradelacobragay(ctx);
});

// Comando /memedeldia para obtener un meme aleatorio
bot.command("meme", async (ctx) => {
  try {
    ctx.reply(`Tú sí que eres un meme`, {
      reply_to_message_id: ctx.message.message_id,
    });
    /*const meme = await obtenerMeme();
    ctx.replyWithPhoto(meme.url, {
      caption: `${meme.title}\nFuente: ${meme.postLink}`,
    }); // Enviar el meme como una imagen*/
  } catch (error) {
    console.error("Error obteniendo meme:", error);
    ctx.reply(
      "Hubo un error al obtener el meme. Inténtalo de nuevo más tarde."
    );
  }
});

// Función para obtener un meme aleatorio desde MemeAPI
async function obtenerMeme() {
  try {
    const response = await axios.get("https://meme-api.com/gimme/shitposting");
    const data = response.data;
    return {
      title: data.title,
      url: data.url,
      postLink: data.postLink,
    };
  } catch (error) {
    console.error("Error llamando a MemeAPI:", error);
    throw error;
  }
}

// Función para sumar puntos al ganador del día
async function sumarPuntosAGanador(ganadorUsername) {
  try {
    const userDoc = db.collection("usuarios").doc(ganadorUsername);
    const userData = (await userDoc.get()).data();
    await userDoc.update({
      puntos: userData.puntos + 1,
      puntosMensuales: userData.puntosMensuales + 1,
    });
  } catch (error) {
    console.error("Error sumando puntos al ganador:", error);
  }
}

// Función para sumar puntos al ganador del día
async function sumarPuntosAGanadorMes(ganadorUsername) {
  try {
    const userDoc = db.collection("usuarios").doc(ganadorUsername);
    const userData = (await userDoc.get()).data();
    await userDoc.update({
      puntosAnuales: userData.puntosAnuales + 1,
    });
  } catch (error) {
    console.error("Error sumando puntos al ganador:", error);
  }
}

const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.second = 50;
rule.tz = TIMEZONE;

const monthRule = new schedule.RecurrenceRule();
monthRule.hour = 23;
monthRule.minute = 59;
monthRule.second = 52;
monthRule.tz = TIMEZONE;
// Obtenemos el último día del mes actual
const now = moment.tz(TIMEZONE);
const lastDay = now.clone().endOf("month").date(); // Último día del mes
monthRule.date = lastDay; // Especificamos que sea el último día del mes

// Función para obtener la fecha del último día del mes a una hora específica
function getLastDayOfMonth(hour, minute, second = 0) {
  const now = moment.tz(TIMEZONE);
  const lastDayOfMonth = now
    .endOf("month")
    .set({ hour, minute, second, millisecond: 0 });
  return lastDayOfMonth.toDate();
}

function getLastDayOfYearRule() {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 23;
  rule.minute = 59;
  rule.second = 55;

  // Especificamos que sea el día 31 del mes 12 (diciembre)
  rule.month = 11; // Diciembre (los meses en RecurrenceRule son 0-indexed, 0=enero)
  rule.date = 31; // Día 31 de diciembre

  return rule;
}

// Función para obtener la fecha del último día del año a una hora específica
function getLastDayOfYear(hour, minute, second = 0) {
  const now = moment.tz(TIMEZONE);
  const lastDayOfYear = now
    .endOf("year")
    .set({ hour, minute, second, millisecond: 0 });
  return lastDayOfYear.toDate();
}

// Programación de tareas automáticas
schedule.scheduleJob(rule, async () => {
  // 23:59 cada día
  console.log("Ejecutando tarea diaria...");
  const today = obtenerFechaHoy();
  try {
    // Obtener el chat_id del grupo desde Firestore
    const groupDoc = await db.collection("config").doc("grupo").get();
    const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
    if (!groupId) {
      console.log(
        "No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes."
      );
    }
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];
    let cobardes = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        ranking.push({ username: data.username, porcentaje: data.porcentaje });
      } else {
        cobardes.push(data.username);
      }
    });

    if (cobardes.length > 0 && !(cobardes.length === 1)) {
      let cobardesMensaje = `Los homos del día son:\n\n`;
      cobardes.forEach((user, index) => {
        sumarPuntosAGanador(user);
        cobardesMensaje += `· ${user}\n`;
      });
      await bot.telegram.sendMessage(groupId, cobardesMensaje);
      await bot.telegram.sendMessage(groupId, "Por cobardes");
    } else if (cobardes.length === 1) {
      sumarPuntosAGanador(cobardes[0]);
      if (cobardes[0] === "@ireeneeri")
        await bot.telegram.sendMessage(
          groupId,
          `La homo del día es ${cobardes[0]} por cobarde`
        );
      else
        await bot.telegram.sendMessage(
          groupId,
          `El homo del día es ${cobardes[0]} por cobarde`
        );
      await bot.telegram.sendMessage(
        groupId,
        "Pulse aquí -> /s si ya lo suponías"
      );
    } else {
      const maxPorcentaje = Math.max(...ranking.map((user) => user.porcentaje));
      const ganadores = ranking.filter(
        (user) => user.porcentaje === maxPorcentaje
      );

      if (ganadores.length === 1) {
        sumarPuntosAGanador(ganadores[0].username);
        if (ganadores[0].username === "@ireeneeri")
          await bot.telegram.sendMessage(
            groupId,
            `La homo del día es ${ganadores[0].username} con un ${ganadores[0].porcentaje}% de vasto incremento`
          );
        else
          await bot.telegram.sendMessage(
            groupId,
            `El homo del día es ${ganadores[0].username} con un ${ganadores[0].porcentaje}% de vasto incremento`
          );
      } else {
        let ganadoresMensaje = `Los homos del día son:\n\n`;
        ganadores.forEach((user, index) => {
          sumarPuntosAGanador(user.username);
          ganadoresMensaje += `· ${user.username}\n`;
        });
        ganadoresMensaje += `\nTodos con un vasto incremento del ${ganadores[0].porcentaje}%`;
        await bot.telegram.sendMessage(groupId, ganadoresMensaje);
      }
      await bot.telegram.sendMessage(
        groupId,
        "Pulse aquí -> /s si ya lo suponías"
      );
    }

    const batch = db.batch();
    // Ganar dinero segun la heterosexualidad
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userDoc = db.collection("usuarios").doc(doc.id);
      if (userData.porcentaje != null && userData.porcentaje < 100) {
        batch.update(userDoc, {
          dinero:
            parseFloat(userData.dinero) +
            parseFloat(((100 - userData.porcentaje) / 100).toFixed(2)),
        });
      }
    });

    // Resetear porcentajes para el siguiente día
    usersSnapshot.forEach((doc) => {
      const userDoc = db.collection("usuarios").doc(doc.id);
      batch.update(userDoc, { porcentaje: null, desempate: null });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error en la tarea diaria:", error);
  }
});

// Tarea mensual (último día de cada mes a las 23:59)
schedule.scheduleJob(monthRule, async () => {
  console.log("Ejecutando tarea mensual...");
  try {
    // Obtener el chat_id del grupo desde Firestore
    const groupDoc = await db.collection("config").doc("grupo").get();
    const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
    console.log(groupId);
    if (!groupId) {
      console.log(
        "No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes."
      );
    }
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      ranking.push({
        username: data.username,
        puntosMensuales: data.puntosMensuales,
      });
    });

    const maxPuntos = Math.max(...ranking.map((user) => user.puntosMensuales));
    const ganadores = ranking.filter(
      (user) => user.puntosMensuales === maxPuntos
    );

    if (ganadores.length === 1) {
      sumarPuntosAGanadorMes(ganadores[0].username);
      if (ganadores[0].username === "@ireeneeri")
        await bot.telegram.sendMessage(
          groupId,
          `La homo del mes es ${ganadores[0].username} con un total de ${ganadores[0].puntosMensuales} puntos`
        );
      else
        await bot.telegram.sendMessage(
          groupId,
          `El homo del mes es ${ganadores[0].username} con un total de ${ganadores[0].puntosMensuales} puntos`
        );
    } else {
      let ganadoresMensaje = `Los homos del mes son:\n\n`;
      ganadores.forEach((user, index) => {
        sumarPuntosAGanadorMes(user.username);
        ganadoresMensaje += `- ${user.username}\n`;
      });
      ganadoresMensaje += `\nTodos con ${ganadores[0].puntosMensuales} puntos`;
      await bot.telegram.sendMessage(groupId, ganadoresMensaje);
    }
    await bot.telegram.sendMessage(
      groupId,
      "Pulse aquí -> /s si ya lo suponías"
    );

    // Resetear porcentajes para el siguiente mes
    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
      const userDoc = db.collection("usuarios").doc(doc.id);
      batch.update(userDoc, { puntosMensuales: 0 });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error en la tarea mensual:", error);
  }
});

// Tarea anual (31 de diciembre a las 23:59)
schedule.scheduleJob(getLastDayOfYearRule(), async () => {
  try {
    // Obtener el chat_id del grupo desde Firestore
    const groupDoc = await db.collection("config").doc("grupo").get();
    const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
    console.log(groupId);
    if (!groupId) {
      console.log(
        "No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes."
      );
    }
    const usersSnapshot = await db.collection("usuarios").get();
    let ranking = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      ranking.push({
        username: data.username,
        puntosAnuales: data.puntosAnuales,
      });
    });

    const maxPuntos = Math.max(...ranking.map((user) => user.puntosAnuales));
    const ganadores = ranking.filter(
      (user) => user.puntosAnuales === maxPuntos
    );

    if (ganadores.length === 1) {
      if (ganadores[0].username === "@ireeneeri")
        await bot.telegram.sendMessage(
          groupId,
          `El homo del año es ${ganadores[0].username} con un total de ${ganadores[0].puntosMensuales} puntos`
        );
      else
        await bot.telegram.sendMessage(
          groupId,
          `La homo del año es ${ganadores[0].username} con un total de ${ganadores[0].puntosMensuales} puntos`
        );
    } else {
      let ganadoresMensaje = `Los homos del año son:\n\n`;
      ganadores.forEach((user, index) => {
        ganadoresMensaje += `- ${user.username}\n`;
      });
      ganadoresMensaje += `\nTodos con ${ganadores[0].puntosAnuales} puntos`;
      await bot.telegram.sendMessage(groupId, ganadoresMensaje);
    }
    await bot.telegram.sendMessage(
      groupId,
      "Pulse aquí -> /s si ya lo suponías"
    );
    await bot.telegram.sendMessage(groupId, "Y feliz año Udrea");
    await enviarMensajeAleatorio(ctx, "udreaMessages");

    // Resetear porcentajes para el siguiente mes
    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
      const userDoc = db.collection("usuarios").doc(doc.id);
      batch.update(userDoc, { puntosAnuales: 0 });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error en la tarea mensual:", error);
  }
});

// Comando /addmensaje para iniciar el modo de agregar mensajes
bot.command("addmensaje", (ctx) => {
  if (ctx.chat.type == "private") {
    modoAnunciar = true; // Reutilizar la variable modoAnunciar para este propósito
    mensajesParaAnunciar = []; // Limpiar los mensajes previos
    ctx.reply(
      "Modo de agregar mensajes activado. Envía el mensaje (texto, imagen, audio, etc.) que deseas agregar.\nUsa /guardarudrea o /guardarm para guardar y /cancelar para cancelar."
    );
  }
});

// Variables globales para manejar el estado del anuncio
let mensajesParaAnunciar = [];
let modoAnunciar = false;

// Comando /anunciar para iniciar el modo de anuncio
bot.command("anunciar", (ctx) => {
  if (ctx.chat.type == "private") {
    modoAnunciar = true; // Activar modo de anuncio
    mensajesParaAnunciar = []; // Limpiar los mensajes previos
    ctx.reply(
      "Modo de anuncio activado. Envía los mensajes que quieres anunciar. Cuando termines, escribe /enviar o usa /cancelar para cancelar."
    );
  }
});

// Capturar mensajes de texto mientras está activado el modo de anuncio
bot.on("text", (ctx) => {
  if (ctx.chat.type === "private" && modoAnunciar) {
    const mensaje = ctx.message.text;

    // Verificar si el mensaje es un comando
    if (mensaje.startsWith("/")) {
      if (mensaje === "/enviar") {
        return enviarMensajes(ctx); // Llamar a la función para enviar los mensajes
      } else if (mensaje === "/cancelar") {
        return cancelarAnuncio(ctx); // Llamar a la función para cancelar
      } else if (mensaje === "/guardarudrea") {
        return guardarMensajes(ctx, "udreaMessages"); // Función para guardar los mensajes en Firestore
      } else if (mensaje === "/guardarm") {
        return guardarMensajes(ctx, "mMessages"); // Función para guardar los mensajes en Firestore
      }
    } else {
      // Si no es un comando, se almacena como mensaje para anunciar
      mensajesParaAnunciar.push({ type: "text", content: mensaje });
      ctx.reply(
        "Mensaje recibido. Puedes seguir enviando mensajes o usar /enviar para enviarlos a los grupos."
      );
    }
  }
});

// Capturar imágenes
bot.on("photo", (ctx) => {
  if (ctx.chat.type === "private" && modoAnunciar) {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id; // Obtener la mejor resolución de la foto
    mensajesParaAnunciar.push({ type: "photo", content: photoId });
    ctx.reply(
      "Imagen recibida. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos."
    );
  }
});

// Capturar GIFs animados
bot.on("animation", (ctx) => {
  if (ctx.chat.type === "private" && modoAnunciar) {
    const animationId = ctx.message.animation.file_id;
    mensajesParaAnunciar.push({ type: "animation", content: animationId });
    ctx.reply(
      "GIF recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos."
    );
  }
});

// Capturar stickers
bot.on("sticker", (ctx) => {
  if (ctx.chat.type === "private" && modoAnunciar) {
    const stickerId = ctx.message.sticker.file_id;
    mensajesParaAnunciar.push({ type: "sticker", content: stickerId });
    ctx.reply(
      "Sticker recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos."
    );
  }
});

// Capturar mensajes de voz
bot.on("voice", (ctx) => {
  if (ctx.chat.type === "private" && modoAnunciar) {
    const voiceId = ctx.message.voice.file_id;
    mensajesParaAnunciar.push({ type: "voice", content: voiceId });
    ctx.reply(
      "Mensaje de voz recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos."
    );
  }
});

// Función para enviar los mensajes a los grupos
async function enviarMensajes(ctx) {
  if (!modoAnunciar) {
    return ctx.reply("Primero activa el modo de anuncio usando /anunciar.");
  }

  if (mensajesParaAnunciar.length === 0) {
    return ctx.reply("No hay mensajes para enviar.");
  }

  try {
    // Obtener el chat_id del grupo desde Firestore
    const groupDoc = await db.collection("config").doc("grupo").get();
    const groupId = groupDoc.exists ? groupDoc.data().groupId : null;

    if (!groupId) {
      return ctx.reply(
        "No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes."
      );
    }

    // Enviar cada mensaje al grupo
    for (const mensaje of mensajesParaAnunciar) {
      switch (mensaje.type) {
        case "text":
          await bot.telegram.sendMessage(groupId, mensaje.content);
          break;
        case "photo":
          await bot.telegram.sendPhoto(groupId, mensaje.content);
          break;
        case "animation":
          await bot.telegram.sendAnimation(groupId, mensaje.content);
          break;
        case "sticker":
          await bot.telegram.sendSticker(groupId, mensaje.content);
          break;
        case "voice":
          await bot.telegram.sendVoice(groupId, mensaje.content);
          break;
        default:
          console.log("Tipo de mensaje no soportado:", mensaje.type);
      }
    }

    ctx.reply("Mensajes enviados a los grupos.");
  } catch (error) {
    console.error("Error enviando mensajes:", error);
    ctx.reply("Hubo un error al enviar los mensajes.");
  }

  // Reiniciar el modo de anuncio y limpiar los mensajes
  modoAnunciar = false;
  mensajesParaAnunciar = [];
}

// Función para cancelar el modo de anuncio y limpiar los mensajes
function cancelarAnuncio(ctx) {
  if (!modoAnunciar) {
    return ctx.reply("No hay nada que cancelar.");
  }

  // Cancelar el modo de anuncio y limpiar los mensajes
  modoAnunciar = false;
  mensajesParaAnunciar = [];
  ctx.reply("Modo de anuncio cancelado. Los mensajes no serán enviados.");
}

// Comando /noenviar explícito para mayor claridad
bot.command("noenviar", (ctx) => {
  if (ctx.chat.type == "private") {
    cancelarAnuncio(ctx);
  }
});

// Comando /enviar explícito para mayor claridad
bot.command("enviar", (ctx) => {
  if (ctx.chat.type == "private") {
    enviarMensajes(ctx);
  }
});

// Función para guardar los mensajes en Firestore
async function guardarMensajes(ctx, coleccion) {
  if (!modoAnunciar) {
    return ctx.reply(
      "Primero activa el modo de agregar mensajes usando /addmensaje."
    );
  }

  if (mensajesParaAnunciar.length === 0) {
    return ctx.reply("No hay mensajes para guardar.");
  }

  try {
    const batch = db.batch(); // Batch para guardar múltiples mensajes
    mensajesParaAnunciar.forEach((mensaje) => {
      const newDoc = db.collection(coleccion).doc();
      batch.set(newDoc, mensaje);
    });

    await batch.commit(); // Guardar en Firestore
    ctx.reply("Mensajes guardados correctamente.");
  } catch (error) {
    console.error("Error guardando mensajes:", error);
    ctx.reply("Hubo un error al guardar los mensajes.");
  }

  modoAnunciar = false;
  mensajesParaAnunciar = [];
}

// Comando explícito para cancelar el modo de agregar mensajes
bot.command("cancelar", (ctx) => {
  if (ctx.chat.type === "private") {
    cancelarAnuncio(ctx);
  }
});

bot.launch();

// Manejar la detención del bot con mensajes de log
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
