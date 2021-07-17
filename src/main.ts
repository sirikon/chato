import { Telegraf } from 'telegraf';

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN missing");
if (!process.env.ADMIN_CHAT_ID) throw new Error("ADMIN_CHAT_ID missing");

const botToken: string = process.env.BOT_TOKEN;
const adminChatId: number = parseInt(process.env.ADMIN_CHAT_ID);

const bot = new Telegraf(botToken);

const expectAnuncioIndex: { [key: number]: boolean } = {};

bot.command('help', async (ctx) => {
  ctx.replyWithHTML(`
<b>Henlo</b>. Soy Chato, el monete que acepta los anuncios para Monke Bazar.

Estas son las cosas con las que puedo ayudarte:
/anuncio - Dame anuncios para publicar.
/help - Muestra la ayuda.
  `.trim());
});

bot.command('anuncio', async (ctx) => {
  expectAnuncioIndex[ctx.chat.id] = true;
  return await ctx.reply('Mándame el anuncio! Si quieres que tenga imágenes, texto, links... envíamelo todo junto en un único mensaje.');
})

bot.on('message', async (ctx) => {
  //console.log(ctx.message);

  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    try {
      await ctx.replyWithHTML('<b>UH UH - AH AHH!</b>');
      await ctx.replyWithSticker('CAACAgQAAxkBAAN-YPLo_EkUjqprsIzE_ub1Jlipt8wAAtQNAAJmbahSt-tZ1rrO9kggBA');
      // await ctx.replyWithAudio('AwACAgQAAxkBAAOAYPLqHZ85FBoyKpmhynS-vQl3HF8AAjwIAAK6UJlTZ5anJo_44N0gBA');
      await ctx.replyWithHTML('YEET!');
      await ctx.reply('https://youtu.be/c1s3Iekns9k');
      await ctx.leaveChat();
    } catch(error) {
      if (error.message.indexOf('bot is not a member of the supergroup chat') === -1) throw error;
    }
    return;
  }

  if (expectAnuncioIndex[ctx.chat.id]) {
    expectAnuncioIndex[ctx.chat.id] = false;

    ctx.forwardMessage(adminChatId);
    return await ctx.reply("Recibido! Tan pronto como podamos lo publicamos");
  }

  ctx.reply('No se de qué hablas UwU. Escribe /help y así nos entendemos.');
})

bot.catch((err, ctx) => {
  console.log(err);
})

bot.launch();
console.log('Bot running');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
