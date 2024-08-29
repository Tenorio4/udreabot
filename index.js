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
    mensajesParaAnunciar.push({ type: 'text', content: ctx.message.text });
    ctx.reply('Mensaje de texto recibido. Puedes seguir enviando mensajes o usar /enviar para enviarlos a los grupos.');
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

    ctx.reply('Mensajes enviados al grupo.');
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

// Resto de comandos y lógica de negocio...

// Lanzar el bot
bot.launch();
console.log('Bot lanzado y escuchando comandos...');
