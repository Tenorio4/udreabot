const express = require('express');
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

// Responder directamente al autor del mensaje
bot.on('text', async (ctx) => {
  // Guardar el mensaje en Firestore
  try {
    await db.collection('messages').add({
      userId: ctx.from.id,
      username: ctx.from.username,
      message: ctx.message.text,
      timestamp: new Date()
    });
    
    // Responder al usuario
    ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`, { reply_to_message_id: ctx.message.message_id });
  } catch (error) {
    console.error('Error guardando el mensaje:', error);
    ctx.reply('Hubo un error al procesar tu mensaje.');
  }
});

// Iniciar el bot
bot.launch();
