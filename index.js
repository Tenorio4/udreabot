const express = require('express');
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

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

// Ruta de ping
app.get('/ping', (req, res) => {
  res.send('Bot is running');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});

// Función para generar un porcentaje aleatorio
function generarPorcentaje() {
  return Math.floor(Math.random() * 101); // 0 a 100%
}

// Comando /start
bot.start((ctx) => ctx.reply('Hola, soy tu bot de Telegram!'));

// Comando /help
bot.help((ctx) => ctx.reply('Envía un mensaje y te responderé!'));

// Responder al comando "nivel"
bot.hears(/nivel/i, async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;

  try {
    // Generar un porcentaje aleatorio para el usuario
    const porcentaje = generarPorcentaje();

    // Guardar el usuario y su porcentaje en Firestore
    await db.collection('usuarios').doc(`${ctx.chat.id}_${userId}`).set({
      userId: userId,
      username: username,
      porcentaje: porcentaje,
      chatId: ctx.chat.id,
      timestamp: new Date(),
    });

    // Responder al usuario con su porcentaje
    ctx.reply(`${username}, tu nivel es: ${porcentaje}%`);
  } catch (error) {
    console.error('Error guardando el nivel:', error);
    ctx.reply('Hubo un error al calcular tu nivel.');
  }
});

// Comando /ranking
bot.command('ranking', async (ctx) => {
  try {
    const usuariosSnapshot = await db.collection('usuarios').where('chatId', '==', ctx.chat.id).get();

    if (usuariosSnapshot.empty) {
      return ctx.reply('No hay usuarios en el ranking.');
    }

    // Crear un ranking con los usuarios ordenados por su porcentaje
    let ranking = 'Ranking de niveles:\n';
    usuariosSnapshot.forEach((doc) => {
      const data = doc.data();
      ranking += `${data.username}: ${data.porcentaje}%\n`;
    });

    ctx.reply(ranking);
  } catch (error) {
    console.error('Error obteniendo el ranking:', error);
    ctx.reply('Hubo un error al obtener el ranking.');
  }
});

// Responder al comando "quien de aqui"
bot.hears(/quien de aqui|quién de aquí|quién de aqui|quien de aquí|quiendeaqui/i, async (ctx) => {
  try {
    const usuariosSnapshot = await db.collection('usuarios').where('chatId', '==', ctx.chat.id).orderBy('porcentaje', 'desc').limit(1).get();

    if (usuariosSnapshot.empty) {
      return ctx.reply('Aún no hay usuarios en el ranking.');
    }

    // Obtener el usuario con el porcentaje más alto
    const topUser = usuariosSnapshot.docs[0].data();
    ctx.reply(`El usuario con mayor nivel es ${topUser.username} con ${topUser.porcentaje}%.`);
  } catch (error) {
    console.error('Error obteniendo el usuario top:', error);
    ctx.reply('Hubo un error al obtener al usuario top.');
  }
});

// Responder directamente al autor del mensaje y manejar la cadena "nivel" y "quien de aqui"
bot.on('text', async (ctx) => {
  const mensaje = ctx.message.text.toLowerCase();

  if (mensaje.includes('nivel')) {
    bot.handleUpdate(ctx.update);
  } else if (mensaje.includes('quien de aqui') || mensaje.includes('quién de aquí') || mensaje.includes('quién de aqui') || mensaje.includes('quien de aquí') || mensaje.includes('quiendeaqui')) {
    bot.handleUpdate(ctx.update);
  }
});

// Iniciar el bot
bot.launch();
