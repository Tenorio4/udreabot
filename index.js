const express = require('express');
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const schedule = require('node-schedule'); // Librería para programación de tareas
const moment = require('moment-timezone'); // Para manejo de zona horaria
const axios = require('axios'); // Para memes

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
// Configurar la zona horaria
const TIMEZONE = 'Europe/Madrid';

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});
const db = admin.firestore();

// Comando para registrar un grupo y guardar su chat_id
bot.command('registrargrupo', async (ctx) => {
  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    const groupId = ctx.chat.id.toString(); // Obtener el chat_id del grupo

    try {
      await db.collection('config').doc('grupo').set({ groupId }); // Guardar el chat_id en Firestore
      ctx.reply('Udrea!');
    } catch (error) {
      console.error('Error registrando el grupo:', error);
      ctx.reply('Hubo un error al registrar el grupo.');
    }
  } else {
    ctx.reply('Este comando solo puede usarse en grupos.');
  }
});

// Lista de usuarios definidos
const usuarios = [
  '@TenorioSRG', '@HooksLasVegas', '@Pmoai', '@ireeneeri',
  '@RangoLV', '@Chewyck', '@Papadopoulos', '@Numuhukumakiakiaialunamor'
];

// Inicializar datos de usuarios en Firestore
async function inicializarUsuarios() {
  try {
    const batch = db.batch();
    usuarios.forEach((username) => {
      const userDoc = db.collection('usuarios').doc(username);
      batch.set(userDoc, {
        username: username,
        porcentaje: null,
        puntos: 0,
        puntosMensuales: 0,
        puntosAnuales: 0,
        ultimaActualizacion: null
      });
    });
    await batch.commit();
    console.log('Usuarios inicializados en la base de datos.');
  } catch (error) {
    console.error('Error inicializando usuarios:', error);
  }
}

//inicializarUsuarios(); // Llamar una vez al inicio

// Ruta de ping
app.get('/ping', (req, res) => {
  res.send('Bot is running');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});

// Comando /start
bot.start((ctx) => ctx.reply('Hola, soy tu bot de Telegram!'));

// Comando /help
bot.help((ctx) => ctx.reply('Envía un mensaje y te responderé!'));

// Función para obtener un porcentaje aleatorio
function obtenerPorcentajeAleatorio() {
  return Math.floor(Math.random() * 101); // 0-100%
}

// Obtener la fecha de hoy en formato 'YYYY-MM-DD'
function obtenerFechaHoy() {
  return new Date().toISOString().split('T')[0];
}

// Función para manejar el comando 'nivel'
bot.hears(/nivel/i, async (ctx) => {
  const username = `@${ctx.from.username}`;
  const today = obtenerFechaHoy();
  
  try {
    const userDoc = db.collection('usuarios').doc(username);
    const userData = (await userDoc.get()).data();
    
    if (userData && userData.ultimaActualizacion === today && !(userData.porcentaje === null)) {
      ctx.reply(`${username} ya te he dicho que tienes un ${userData.porcentaje}% de vasto incremento`);
    } else {
      const nuevoPorcentaje = obtenerPorcentajeAleatorio();
      await userDoc.set({
        ...userData,
        porcentaje: nuevoPorcentaje,
        ultimaActualizacion: today
      });
      ctx.reply(`${username} tiene un ${nuevoPorcentaje}% de vasto incremento`);
    }
  } catch (error) {
    console.error('Error al guardar en Firestore:', error);
    ctx.reply('Hubo un error al calcular tu nivel.');
  }
});

// Comando /ranking para mostrar el ranking del día
bot.command('ranking', async (ctx) => {
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.porcentaje !== null) {
        ranking.push({ username: data.username, porcentaje: data.porcentaje });
      }
    });

    ranking.sort((a, b) => b.porcentaje - a.porcentaje); // Ordenar por porcentaje descendente

    let rankingMensaje = '🏆 Ranking del día 🏆 \n\n';
    ranking.forEach((user, index) => {
      let icono = '';
      let tercer = 0;
      let x = 1;
      switch (index) {
        case 0:
          icono = '🥇'; // Medalla de oro
          primer = user.porcentaje;
          break;
        case 1:
          if (user.porcentaje === ranking[index-1].porcentaje) {
            icono = '🥇'; 
            x += 1;
          } else {
            icono = '🥈'; // Medalla de plata
          }
          break;
        case 2:
          if (user.porcentaje === ranking[index-1].porcentaje) {
              icono = '🥈'; 
              x += 1;
          } else {
            icono = '🥉'; // Medalla de bronce
          }
          break;
        default:
          if (user.porcentaje === tercer) {
              icono = '🥉'; 
              x += 1;
          } else {
            if (user.porcentaje === ranking[index-1].porcentaje) {
              x -= 1;
            }
            rankingMensaje += `${index + x}.`;
            x = 1;
          }
          break;
       }
    rankingMensaje += `${icono} ${user.username}: ${user.porcentaje}%\n`;
    });

    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error('Error obteniendo el ranking:', error);
    ctx.reply('Hubo un error al obtener el ranking.');
  }
});

// Comando /rankingdelmes para mostrar el ranking del mes
bot.command('rankingmensual', async (ctx) => {
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.puntosMensuales !== null) {
        ranking.push({ username: data.username, puntosMensuales: data.puntosMensuales });
      }
    });

    ranking.sort((a, b) => b.puntosMensuales - a.puntosMensuales); // Ordenar por porcentaje descendente

    let rankingMensaje = '🏆 Ranking del mes 🏆 \n\n';
    ranking.forEach((user, index) => {
      let icono = '';
      switch (index) {
        case 0:
          icono = '🥇'; // Medalla de oro
          break;
        case 1:
          icono = '🥈'; // Medalla de plata
          break;
        case 2:
          icono = '🥉'; // Medalla de bronce
          break;
        default:
          rankingMensaje += `${index + 1}.`;
          break;
       }
    rankingMensaje += `${icono} ${user.username}: ${user.puntosMensuales}\n`;
    });

    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error('Error obteniendo el ranking:', error);
    ctx.reply('Hubo un error al obtener el ranking.');
  }
});

// Comando /rankingdelaño para mostrar el ranking del año
bot.command('rankinganual', async (ctx) => {
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.puntosAnuales !== null) {
        ranking.push({ username: data.username, puntosAnuales: data.puntosAnuales });
      }
    });

    ranking.sort((a, b) => b.puntosAnuales - a.puntosAnuales); // Ordenar por porcentaje descendente

    let rankingMensaje = '🏆 Ranking del año 🏆 \n\n';
    ranking.forEach((user, index) => {
      let icono = '';
      let tercer = 0;
      let x = 1;
      switch (index) {
        case 0:
          icono = '🥇'; // Medalla de oro
          primer = user.puntosAnuales;
          break;
        case 1:
          if (user.puntosAnuales === ranking[index-1].puntosAnuales) {
            icono = '🥇'; 
            x += 1;
          } else {
            icono = '🥈'; // Medalla de plata
          }
          break;
        case 2:
          if (user.puntosAnuales === ranking[index-1].puntosAnuales) {
              icono = '🥈'; 
              x += 1;
          } else {
            icono = '🥉'; // Medalla de bronce
          }
          break;
        default:
          if (user.puntosAnuales === tercer) {
              icono = '🥉'; 
              x += 1;
          } else {
            if (user.puntosAnuales === ranking[index-1].puntosAnuales) {
              x -= 1;
            }
            rankingMensaje += `${index + x}.`;
            x = 1;
          }
          break;
       }
    rankingMensaje += `${icono} ${user.username}: ${user.puntosAnuales}\n`;
    });

    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error('Error obteniendo el ranking:', error);
    ctx.reply('Hubo un error al obtener el ranking.');
  }
});

// Comando /cobardes para mostrar a los cobardes del día
bot.command('cobardes', async (ctx) => {
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let cobardes = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.porcentaje == null) {
        cobardes.push({ username: data.username });
      }
    });

    if (cobardes.empty) {
      ctx.reply("Parece que no hay cobardes hoy");
    } else  if (cobardes.length === 1) {
      if (cobardes[0].username === "@ireeneeri")
        ctx.reply(`${cobardes[0].username} es una cobarde`);
      else
        ctx.reply(`${cobardes[0].username} es un cobarde`);
    } else {

      let cobardesMensaje = 'Estos son los cobardes:\n';
      cobardes.forEach((user, index) => {
        cobardesMensaje += `- ${user.username}\n`;
      });
  
      ctx.reply(cobardesMensaje);
    }
  } catch (error) {
    console.error('Error obteniendo a los cobardes:', error);
    ctx.reply('Hubo un error al obtener los cobardes');
  }
});

// Función para manejar "quien de aqui"
bot.hears(/quien\s*de\s*aqui|quién\s*de\s*aquí|quién\s*de\s*aqui|quien\s*de\s*aquí|quiendeaqui|Quiendeaqui/i, async (ctx) => {
  const today = obtenerFechaHoy();
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];
    let cobardes = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.ultimaActualizacion === today) {
        ranking.push({ username: data.username, porcentaje: data.porcentaje });
      } else {
        cobardes.push(data.username);
      }
    });

    if (ranking.length === usuarios.length) {
      const ganador = ranking.reduce((max, user) => user.porcentaje > max.porcentaje ? user : max, ranking[0]);
      ctx.reply(`${ganador.username} es el más homo con un ${ganador.porcentaje}% de vasto incremento`);
    } else {
      if (cobardes.length > 0) {
        const cobardeElegido = cobardes[Math.floor(Math.random() * cobardes.length)];
        ctx.reply(`${cobardeElegido} es un cobarde y por tanto un homo`);
      } else {
        ctx.reply('Parece que todos han hecho su tirada de nivel.');
      }
    }
  } catch (error) {
    console.error('Error en "quien de aqui":', error);
    ctx.reply('José Guillén');
  }
});

// Expresión regular para capturar palabras derivadas de "udrea"
const udreaRegex = /\budrea(a|aa|aaa|aaaa|aaaaa|s|ría|ríe|)\b/i;

// Listener para palabras derivadas de "udrea" o el comando /udrea
bot.hears(udreaRegex, async (ctx) => {
  await enviarMensajeAleatorio(ctx, 'udreaMessages');
});

bot.command('udrea', async (ctx) => {
  await enviarMensajeAleatorio(ctx, 'udreaMessages');
});

bot.command('a', async (ctx) => {
    await enviarMensajeAleatorio(ctx, 'a');
});

bot.command('utsu', async (ctx) => {
    await enviarMensajeAleatorio(ctx, 'utsu');
});

bot.command('s', async (ctx) => {
    await enviarMensajeAleatorio(ctx, 'suponia');
});

bot.command('p', async (ctx) => {
    await enviarMensajeAleatorio(ctx, 'peor');
});

bot.command('c', async (ctx) => {
    await enviarMensajeAleatorio(ctx, 'claro');
});

// Función para enviar un mensaje aleatorio de la colección "udreaMessages" en Firestore
async function enviarMensajeAleatorio(ctx, coleccion) {
  try {
    const messagesSnapshot = await db.collection(coleccion).get();
    if (messagesSnapshot.empty) {
      ctx.reply('Udrea!');
      return;
    }

    // Obtener un mensaje aleatorio
    const mensajes = messagesSnapshot.docs.map(doc => doc.data());
    const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];

    // Enviar el mensaje aleatorio según su tipo
    switch (mensajeAleatorio.type) {
      case 'text':
        await ctx.reply(mensajeAleatorio.content);
        break;
      case 'photo':
        await ctx.replyWithPhoto(mensajeAleatorio.content);
        break;
      case 'animation':
        await ctx.replyWithAnimation(mensajeAleatorio.content);
        break;
      case 'sticker':
        await ctx.replyWithSticker(mensajeAleatorio.content);
        break;
      case 'voice':
        await ctx.replyWithVoice(mensajeAleatorio.content);
        break;
      default:
        console.log('Tipo de mensaje no soportado:', mensajeAleatorio.type);
    }
  } catch (error) {
    console.error('Error enviando mensaje aleatorio:', error);
    ctx.reply('Udrea!');
  }
}

// Función para obtener un precio aleatorio entre 0.01€ y 4.99€
function obtenerPrecioAleatorio() {
  return (Math.random() * (4.99 - 0.01) + 0.01).toFixed(2); // Devuelve un número con 2 decimales
}

// Comando /precio
bot.command('precio', async (ctx) => {
  const today = obtenerFechaHoy();

  try {
    const precioDoc = db.collection('precios').doc(today);
    const precioData = (await precioDoc.get()).data();
    
    if (precioData && precioData.precio) {
      ctx.reply(`El precio de la udrea hoy está a ${precioData.precio}€ la unidad`);
    } else {
      const nuevoPrecio = obtenerPrecioAleatorio();
      await precioDoc.set({
        precio: nuevoPrecio,
        fecha: today
      });
      ctx.reply(`El precio de la udrea hoy está a ${nuevoPrecio}€ la unidad`);
    }
  } catch (error) {
    console.error('Error al guardar el precio en Firestore:', error);
    ctx.reply('Lo siento, se nos han acabado las udreas. Vuelva otro día');
  }
});

bot.command('vender', async (ctx) => {
   ctx.reply("Si alguien te vende udreas no le creas");
});
// Comando /memedeldia para obtener un meme aleatorio
bot.command('meme', async (ctx) => {
  try {
    const meme = await obtenerMeme();
    ctx.replyWithPhoto(meme.url, { caption: `${meme.title}\nFuente: ${meme.postLink}` }); // Enviar el meme como una imagen
  } catch (error) {
    console.error('Error obteniendo meme:', error);
    ctx.reply('Hubo un error al obtener el meme. Inténtalo de nuevo más tarde.');
  }
});

// Función para obtener un meme aleatorio desde MemeAPI
async function obtenerMeme() {
  try {
    const response = await axios.get('https://meme-api.com/gimme/MemesESP');
    const data = response.data;
    return {
      title: data.title,
      url: data.url,
      postLink: data.postLink,
    };
  } catch (error) {
    console.error('Error llamando a MemeAPI:', error);
    throw error;
  }
}

// Función para sumar puntos al ganador del día
async function sumarPuntosAGanador(ganadorUsername) {
  try {
    const userDoc = db.collection('usuarios').doc(ganadorUsername);
    const userData = (await userDoc.get()).data();
    await userDoc.update({
      puntos: userData.puntos + 1,
      puntosMensuales: userData.puntosMensuales + 1,
    });
  } catch (error) {
    console.error('Error sumando puntos al ganador:', error);
  }
}

// Función para sumar puntos al ganador del día
async function sumarPuntosAGanadorMes(ganadorUsername) {
  try {
    const userDoc = db.collection('usuarios').doc(ganadorUsername);
    const userData = (await userDoc.get()).data();
    await userDoc.update({
      puntosAnuales: userData.puntosAnuales + 1
    });
  } catch (error) {
    console.error('Error sumando puntos al ganador:', error);
  }
}

// Convertir la hora a la zona horaria especificada
function getTimeInTimezone(hour, minute, second = 0) {
  const now = moment.tz(TIMEZONE);
  return now.set({ hour, minute, second, millisecond: 0 }).toDate();
}

// Función para obtener la fecha del último día del mes a una hora específica
function getLastDayOfMonth(hour, minute, second = 0) {
  const now = moment.tz(TIMEZONE);
  const lastDayOfMonth = now.endOf('month').set({ hour, minute, second, millisecond: 0 });
  return lastDayOfMonth.toDate();
}

// Función para obtener la fecha del último día del año a una hora específica
function getLastDayOfYear(hour, minute, second = 0) {
  const now = moment.tz(TIMEZONE);
  const lastDayOfYear = now.endOf('year').set({ hour, minute, second, millisecond: 0 });
  return lastDayOfYear.toDate();
}

// Programación de tareas automáticas
schedule.scheduleJob(getTimeInTimezone(15, 10, 50), async () => { // 23:59 cada día   
  console.log('Ejecutando tarea diaria...');
  const today = obtenerFechaHoy();
  try {
      // Obtener el chat_id del grupo desde Firestore
      const groupDoc = await db.collection('config').doc('grupo').get();
      const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
      console.log(groupId);
    if (!groupId) {
     console.log('No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes.');
    }
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];
    let cobardes = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.ultimaActualizacion === today) {
        ranking.push({ username: data.username, porcentaje: data.porcentaje });
      } else {
        cobardes.push(data.username);
      }
    });

    if (cobardes.length > 0 && !(cobardes.length === 1)) {
      let cobardesMensaje = `Los homos del día son:\n`;
      cobardes.forEach((user, index) => {
        sumarPuntosAGanador(user);
        cobardesMensaje += `- ${user}\n`;
      });
      bot.telegram.sendMessage(groupId, cobardesMensaje);
      bot.telegram.sendMessage(groupId, "Por cobardes");
    } else if (cobardes.length === 1){
      sumarPuntosAGanador(cobardes[0]);
       if (cobardes[0] === "@ireeneeri")
        bot.telegram.sendMessage(groupId, `El homo del día es ${cobardes[0]} por cobarde`);
      else
        bot.telegram.sendMessage(groupId, `La homo del día es ${cobardes[0]} por cobarde`);
      bot.telegram.sendMessage(groupId, "Pulse aquí -> /s si ya lo suponías");
    } else {
      const maxPorcentaje = Math.max(...ranking.map(user => user.porcentaje));
      const ganadores = ranking.filter(user => user.porcentaje === maxPorcentaje);
      
      if (ganadores.length === 1) {
        sumarPuntosAGanador(ganador.username);
        if (ganador.username === "@ireeneeri")
          bot.telegram.sendMessage(groupId, `El homo del día es ${ganador.username} con un ${ganador.porcentaje}% de vasto incremento`);
        else
          bot.telegram.sendMessage(groupId, `La homo del día es ${ganador.username} con un ${ganador.porcentaje}% de vasto incremento`);      
      } else {
        let ganadoresMensaje = `Los homos del día son:\n`;
        ganadores.forEach((user, index) => {
          sumarPuntosAGanador(user.username);
          ganadoresMensaje += `- ${user.username} con un ${user.username}% de vasto incremento\n`;
        });
        bot.telegram.sendMessage(groupId, ganadoresMensaje);    
      }
      bot.telegram.sendMessage(groupId, "Pulse aquí -> /s si ya lo suponías");
    }

    // Resetear porcentajes para el siguiente día
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const userDoc = db.collection('usuarios').doc(doc.id);
      batch.update(userDoc, { porcentaje: null });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error en la tarea diaria:', error);
  }
});

// Tarea mensual (último día de cada mes a las 23:59)
schedule.scheduleJob(getLastDayOfMonth(23, 59, 52), async () => { 
  try {
      // Obtener el chat_id del grupo desde Firestore
      const groupDoc = await db.collection('config').doc('grupo').get();
      const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
      console.log(groupId);
    if (!groupId) {
     console.log('No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes.');
    }
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
        ranking.push({ username: data.username, puntosMensuales: data.puntosMensuales });
    });

    const ganador = ranking.reduce((max, user) => user.puntosMensuales > max.puntosMensuales ? user : max, ranking[0]);
    sumarPuntosAGanadorMes(ganador.username);
    if (ganador.username === "@ireeneeri")
      bot.telegram.sendMessage(groupId, `El homo del mes es ${ganador.username} con un total de ${ganador.puntosMensuales} puntos`);
    else
      bot.telegram.sendMessage(groupId, `La homo del mes es ${ganador.username} con un total de ${ganador.puntosMensuales} puntos`);
    bot.telegram.sendMessage(groupId, "Pulse aquí -> /s si ya lo suponías");
    

    // Resetear porcentajes para el siguiente mes
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const userDoc = db.collection('usuarios').doc(doc.id);
      batch.update(userDoc, { puntosMensuales: 0 });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error en la tarea mensual:', error);
  }
});

// Tarea anual (31 de diciembre a las 23:59)
schedule.scheduleJob(getLastDayOfYear(23, 59, 55), async () => { 
  try {
      // Obtener el chat_id del grupo desde Firestore
      const groupDoc = await db.collection('config').doc('grupo').get();
      const groupId = groupDoc.exists ? groupDoc.data().groupId : null;
      console.log(groupId);
    if (!groupId) {
     console.log('No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes.');
    }
    const usersSnapshot = await db.collection('usuarios').get();
    let ranking = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
        ranking.push({ username: data.username, puntosAnuales: data.puntosAnuales });
    });

    const ganador = ranking.reduce((max, user) => user.puntosAnuales > max.puntosAnuales ? user : max, ranking[0]);
    if (ganador.username === "@ireeneeri")
      bot.telegram.sendMessage(groupId, `El homo del mes es ${ganador.username} con un total de ${ganador.puntosAnuales} puntos`);
    else
      bot.telegram.sendMessage(groupId, `La homo del mes es ${ganador.username} con un total de ${ganador.puntosAnuales} puntos`);
    bot.telegram.sendMessage(groupId, "Pulse aquí -> /s si ya lo suponías");
    

    // Resetear porcentajes para el siguiente mes
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const userDoc = db.collection('usuarios').doc(doc.id);
      batch.update(userDoc, { puntosAnuales: 0 });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error en la tarea mensual:', error);
  }
});

// Comando /addudrea para iniciar el modo de agregar mensajes
bot.command('addudrea', (ctx) => {
  if (ctx.chat.type == 'private') {
    modoAnunciar = true; // Reutilizar la variable modoAnunciar para este propósito
    mensajesParaAnunciar = []; // Limpiar los mensajes previos
    ctx.reply('Modo de agregar mensajes activado. Envía el mensaje (texto, imagen, audio, etc.) que deseas agregar. Usa /guardarudrea para guardar o /cancelarudrea para cancelar.');
  } 
});


// Variables globales para manejar el estado del anuncio
let mensajesParaAnunciar = [];
let modoAnunciar = false;

// Comando /anunciar para iniciar el modo de anuncio
bot.command('anunciar', (ctx) => {
  if (ctx.chat.type == 'private') {    
    modoAnunciar = true;  // Activar modo de anuncio
    mensajesParaAnunciar = [];  // Limpiar los mensajes previos
    ctx.reply('Modo de anuncio activado. Envía los mensajes que quieres anunciar. Cuando termines, escribe /enviar o usa /noenviar para cancelar.');
}
});

// Capturar mensajes de texto mientras está activado el modo de anuncio
bot.on('text', (ctx) => {   
  if (ctx.chat.type === 'private' && modoAnunciar) {
    const mensaje = ctx.message.text;
    
    // Verificar si el mensaje es un comando
    if (mensaje.startsWith('/')) {
      if (mensaje === '/enviar') {
        return enviarMensajes(ctx);  // Llamar a la función para enviar los mensajes
      } else if (mensaje === '/noenviar') {
        return cancelarAnuncio(ctx);  // Llamar a la función para cancelar
      } else if (mensaje === '/guardarudrea') {
        return guardarMensajesUdrea(ctx); // Función para guardar los mensajes en Firestore
      } else if (mensaje === '/cancelarudrea') {
        return cancelarAnuncio(ctx); // Reutilizamos la función cancelarAnuncio para cancelar el modo de agregar mensajes
      }
    } else {
      // Si no es un comando, se almacena como mensaje para anunciar
      mensajesParaAnunciar.push({ type: 'text', content: mensaje });
      ctx.reply('Mensaje recibido. Puedes seguir enviando mensajes o usar /enviar para enviarlos a los grupos.');
    }
  }
});

// Capturar imágenes
bot.on('photo', (ctx) => {
  if (ctx.chat.type === 'private' && modoAnunciar) {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id; // Obtener la mejor resolución de la foto
    mensajesParaAnunciar.push({ type: 'photo', content: photoId });
    ctx.reply('Imagen recibida. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos.');
  }
});

// Capturar GIFs animados
bot.on('animation', (ctx) => {
  if (ctx.chat.type === 'private' && modoAnunciar) {
    const animationId = ctx.message.animation.file_id;
    mensajesParaAnunciar.push({ type: 'animation', content: animationId });
    ctx.reply('GIF recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos.');
  }
});

// Capturar stickers
bot.on('sticker', (ctx) => {
  if (ctx.chat.type === 'private' && modoAnunciar) {
    const stickerId = ctx.message.sticker.file_id;
    mensajesParaAnunciar.push({ type: 'sticker', content: stickerId });
    ctx.reply('Sticker recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos.');
  }
});

// Capturar mensajes de voz
bot.on('voice', (ctx) => {
  if (ctx.chat.type === 'private' && modoAnunciar) {
    const voiceId = ctx.message.voice.file_id;
    mensajesParaAnunciar.push({ type: 'voice', content: voiceId });
    ctx.reply('Mensaje de voz recibido. Puedes seguir enviando más contenido o usar /enviar para enviarlos a los grupos.');
  }
});

// Función para enviar los mensajes a los grupos
async function enviarMensajes(ctx) {
  if (!modoAnunciar) {
    return ctx.reply('Primero activa el modo de anuncio usando /anunciar.');
  }

  if (mensajesParaAnunciar.length === 0) {
    return ctx.reply('No hay mensajes para enviar.');
  }

  try {
      // Obtener el chat_id del grupo desde Firestore
      const groupDoc = await db.collection('config').doc('grupo').get();
      const groupId = groupDoc.exists ? groupDoc.data().groupId : null;

      if (!groupId) {
        return ctx.reply('No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes.');
      }

    // Enviar cada mensaje al grupo
    for (const mensaje of mensajesParaAnunciar) {
      switch (mensaje.type) {
        case 'text':
          await bot.telegram.sendMessage(groupId, mensaje.content);
          break;
        case 'photo':
          await bot.telegram.sendPhoto(groupId, mensaje.content);
          break;
        case 'animation':
          await bot.telegram.sendAnimation(groupId, mensaje.content);
          break;
        case 'sticker':
          await bot.telegram.sendSticker(groupId, mensaje.content);
          break;
        case 'voice':
          await bot.telegram.sendVoice(groupId, mensaje.content);
          break;
        default:
          console.log('Tipo de mensaje no soportado:', mensaje.type);
      }
    }

    ctx.reply('Mensajes enviados a los grupos.');
  } catch (error) {
    console.error('Error enviando mensajes:', error);
    ctx.reply('Hubo un error al enviar los mensajes.');
  }

  // Reiniciar el modo de anuncio y limpiar los mensajes
  modoAnunciar = false;
  mensajesParaAnunciar = [];
}

// Función para cancelar el modo de anuncio y limpiar los mensajes
function cancelarAnuncio(ctx) {
  if (!modoAnunciar) {
    return ctx.reply('No hay nada que cancelar.');
  }

  // Cancelar el modo de anuncio y limpiar los mensajes
  modoAnunciar = false;
  mensajesParaAnunciar = [];
  ctx.reply('Modo de anuncio cancelado. Los mensajes no serán enviados.');
}

// Comando /noenviar explícito para mayor claridad
bot.command('noenviar', (ctx) => {
  if (ctx.chat.type == 'private') {
    cancelarAnuncio(ctx);
}
});

// Comando /enviar explícito para mayor claridad
bot.command('enviar', (ctx) => {
  if (ctx.chat.type == 'private') {
    enviarMensajes(ctx);
}
});

// Función para guardar los mensajes en Firestore
async function guardarMensajesUdrea(ctx) {
  if (!modoAnunciar) {
    return ctx.reply('Primero activa el modo de agregar mensajes usando /addudrea.');
  }

  if (mensajesParaAnunciar.length === 0) {
    return ctx.reply('No hay mensajes para guardar.');
  }

  try {
    const batch = db.batch(); // Batch para guardar múltiples mensajes
    mensajesParaAnunciar.forEach((mensaje) => {
      const newDoc = db.collection('udreaMessages').doc();
      batch.set(newDoc, mensaje);
    });

    await batch.commit(); // Guardar en Firestore
    ctx.reply('Mensajes guardados correctamente.');

  } catch (error) {
    console.error('Error guardando mensajes:', error);
    ctx.reply('Hubo un error al guardar los mensajes.');
  }

  modoAnunciar = false;
  mensajesParaAnunciar = [];
}

// Comando explícito para cancelar el modo de agregar mensajes
bot.command('cancelarudrea', (ctx) => {
  if (ctx.chat.type === 'private') {
    cancelarAnuncio(ctx);
  }
});

bot.launch();

// Manejar la detención del bot con mensajes de log
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
