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

// Función para generar un porcentaje aleatorio
function generarPorcentaje() {
  return Math.floor(Math.random() * 101);
}

// Responder directamente al autor del mensaje y manejar la cadena "quien de aqui"
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

    // Verificar si el mensaje contiene "quien de aqui" (con o sin tildes)
    const mensaje = ctx.message.text.toLowerCase();
    if (mensaje.includes('quien de aqui') || mensaje.includes('quién de aquí') || mensaje.includes('quién de aqui') || mensaje.includes('quien de aquí') || mensaje.includes('quiendeaqui')) {
      // Obtener los miembros del grupo
      const miembros = await ctx.getChatMembersCount();
      let listaMiembros = [];

      // Iterar sobre los miembros del grupo
      for (let i = 0; i < miembros; i++) {
        try {
          const miembro = await ctx.telegram.getChatMember(ctx.chat.id, i);
           ctx.reply(miembro.user.username);
          const porcentaje = generarPorcentaje();
          if (miembro.user.is_bot === false) {  // Ignorar bots
            listaMiembros.push(`${miembro.user.first_name || miembro.user.username}: ${porcentaje}%`);
          }
        } catch (error) {
          console.error(`Error obteniendo miembro con id ${i}:`, error);
        }
      }

      // Enviar la lista de miembros con sus porcentajes
      if (listaMiembros.length > 0) {
        ctx.reply(`Aquí está la lista de miembros del grupo con sus porcentajes:\n\n${listaMiembros.join('\n')}`);
      } else {
        ctx.reply('No pude obtener la lista de miembros.');
      }
    }
  } catch (error) {
    console.error('Error guardando el mensaje:', error);
    ctx.reply('Hubo un error al procesar tu mensaje.');
  }
});

// Iniciar el bot
bot.launch();
