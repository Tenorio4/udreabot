const express = require('express');
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const schedule = require('node-schedule'); // Librería para programación de tareas

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

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

inicializarUsuarios(); // Llamar una vez al inicio

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
    
    if (userData && userData.ultimaActualizacion === today) {
      ctx.reply(`Tu nivel de hoy ya ha sido tirado: ${userData.porcentaje}%`);
    } else {
      const nuevoPorcentaje = obtenerPorcentajeAleatorio();
      await userDoc.set({
        ...userData,
        porcentaje: nuevoPorcentaje,
        ultimaActualizacion: today
      });
      ctx.reply(`Tu nivel de hoy es: ${nuevoPorcentaje}%`);
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

    let rankingMensaje = 'Ranking del día:\n';
    ranking.forEach((user, index) => {
      rankingMensaje += `${index + 1}. ${user.username}: ${user.porcentaje}%\n`;
    });

    ctx.reply(rankingMensaje);
  } catch (error) {
    console.error('Error obteniendo el ranking:', error);
    ctx.reply('Hubo un error al obtener el ranking.');
  }
});

// Función para manejar "quien de aqui"
bot.hears(/quien\s*de\s*aqui|quién\s*de\s*aquí|quiendeaqui|Quiendeaqui/i, async (ctx) => {
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
      ctx.reply(`El usuario con más porcentaje hoy es ${ganador.username} con ${ganador.porcentaje}%`);
    } else {
      if (cobardes.length > 0) {
        const cobardeElegido = cobardes[Math.floor(Math.random() * cobardes.length)];
        ctx.reply(`¡${cobardeElegido} es un cobarde que aún no ha hecho su tirada de nivel!`);
      } else {
        ctx.reply('Parece que todos han hecho su tirada de nivel.');
      }
    }
  } catch (error) {
    console.error('Error en "quien de aqui":', error);
    ctx.reply('Hubo un error al procesar la solicitud.');
  }
});

// Función para sumar puntos al ganador del día
async function sumarPuntosAGanador(ganadorUsername) {
  try {
    const userDoc = db.collection('usuarios').doc(ganadorUsername);
    const userData = (await userDoc.get()).data();
    await userDoc.update({
      puntos: userData.puntos + 1,
      puntosMensuales: userData.puntosMensuales + 1,
      puntosAnuales: userData.puntosAnuales + 1
    });
  } catch (error) {
    console.error('Error sumando puntos al ganador:', error);
  }
}

// Programación de tareas automáticas
schedule.scheduleJob('*/5 * * * *', function() => { // 23:59 cada día   
  console.log('Ejecutando tarea diaria...');
  bot.telegram.sendMessage('Ha llegado la hora');
  const today = obtenerFechaHoy();
  try {
      // Obtener el chat_id del grupo desde Firestore
      const groupDoc = await db.collection('config').doc('grupo').get();
      const groupId = groupDoc.exists ? groupDoc.data().groupId : null;

    if (!groupId) {
      bot.telegram.sendMessage('No se ha registrado ningún grupo. Usa /registrargrupo en el grupo donde quieras enviar los mensajes.');
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

    if (cobardes.length > 0) {
      const cobardesMensaje = `Los cobardes que no hicieron su tirada de nivel hoy son: ${cobardes.join(', ')}`;
      bot.telegram.sendMessage(groupId, cobardesMensaje);
    } else {
      const ganador = ranking.reduce((max, user) => user.porcentaje > max.porcentaje ? user : max, ranking[0]);
      sumarPuntosAGanador(ganador.username);
      bot.telegram.sendMessage(groupId, `El ganador del día es ${ganador.username} con ${ganador.porcentaje}%`);
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
schedule.scheduleJob('59 23 L * *', async () => { 
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let maxPuntos = -1;
    let ganadorMes = null;

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.puntosMensuales > maxPuntos) {
        maxPuntos = data.puntosMensuales;
        ganadorMes = data.username;
      }
    });

    bot.telegram.sendMessage(process.env.GROUP_ID, `El ganador del mes es ${ganadorMes} con ${maxPuntos} puntos.`);
    
    // Resetear puntos mensuales para el siguiente mes
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
schedule.scheduleJob('59 23 31 12 *', async () => { 
  try {
    const usersSnapshot = await db.collection('usuarios').get();
    let maxPuntos = -1;
    let ganadorAno = null;

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.puntosAnuales > maxPuntos) {
        maxPuntos = data.puntosAnuales;
        ganadorAno = data.username;
      }
    });

    bot.telegram.sendMessage(process.env.GROUP_ID, `El ganador del año es ${ganadorAno} con ${maxPuntos} puntos.`);
    
    // Resetear puntos anuales para el siguiente año
    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const userDoc = db.collection('usuarios').doc(doc.id);
      batch.update(userDoc, { puntosAnuales: 0 });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error en la tarea anual:', error);
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

bot.launch();
