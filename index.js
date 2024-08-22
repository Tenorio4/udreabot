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
      timestamp: new Date(),
      chatId: ctx.chat.id // Asegura que el chat ID se guarde
    });

    // Responder al usuario
    ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`, { reply_to_message_id: ctx.message.message_id });

    // Verificar si el mensaje contiene "quien de aqui" (con o sin tildes)
    const mensaje = ctx.message.text.toLowerCase();
    if (mensaje.includes('quien de aqui') || mensaje.includes('quién de aquí') || mensaje.includes('quién de aqui') || mensaje.includes('quien de aquí') || mensaje.includes('quiendeaqui')) {
      const userId = ctx.from.id;
      const username = ctx.from.username;
      const chatId = ctx.chat.id;

      // Referencia a la colección de usuarios en Firestore
      const usersRef = db.collection('quienDeAquiUsers').doc(chatId.toString());

      // Intentar obtener el documento de usuarios
      const doc = await usersRef.get();

      let usersList = [];

      if (doc.exists) {
        usersList = doc.data().usersList || [];
      }

      // Verificar si el usuario ya está en la lista
      let userExists = usersList.some(user => user.userId === userId);

      if (!userExists) {
        // Agregar usuario a la lista
        const newUser = {
          userId,
          username,
          percentage: generarPorcentaje()
        };
        usersList.push(newUser);

        // Actualizar el documento en Firestore
        await usersRef.set({ usersList });

        // Generar respuesta con la lista actualizada de usuarios y sus porcentajes
        let respuesta = "Aquí está la lista de usuarios y sus porcentajes:\n";
        usersList.forEach(user => {
          respuesta += `${user.username}: ${user.percentage}%\n`;
        });

        // Enviar respuesta
        ctx.reply(respuesta);
      } else {
        // Si el usuario ya existe, simplemente responde con la lista actual
        let respuesta = "Aquí está la lista de usuarios y sus porcentajes:\n";
        usersList.forEach(user => {
          respuesta += `${user.username}: ${user.percentage}%\n`;
        });

        // Enviar respuesta
        ctx.reply(respuesta);
      }
    }
  } catch (error) {
    console.error('Error guardando el mensaje:', error);
    ctx.reply('Hubo un error al procesar tu mensaje.');
  }
});

// Iniciar el bot
bot.launch();
