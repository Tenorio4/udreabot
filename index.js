const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

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
bot.on('text', (ctx) => {
  ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`, { reply_to_message_id: ctx.message.message_id });
});

// Iniciar el bot
bot.launch();
