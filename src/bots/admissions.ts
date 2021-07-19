import { Telegraf } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';
import { getRequiredEnvVar } from '../utils'

export default function admissions(bot: Telegraf) {
  const admissionsChatId: number = parseInt(getRequiredEnvVar('ADMISSIONS_CHAT_ID'));

  const expectAnuncioIndex: { [key: number]: boolean } = {};

  bot.command('help', async (ctx, next) => {
    if (ctx.chat.id === admissionsChatId) return await next();

    ctx.replyWithHTML(`
<b>Henlo</b>. Soy Chato, el monete que acepta los anuncios para Monke Bazar.

Estas son las cosas con las que puedo ayudarte:
/anuncio - Dame anuncios para publicar.
/help - Muestra la ayuda.
    `.trim());
  });

  bot.command('anuncio', async (ctx, next) => {
    if (ctx.chat.id === admissionsChatId) return await next();

    expectAnuncioIndex[ctx.chat.id] = true;
    return await ctx.reply('Mándame el anuncio! Si quieres que tenga una imagen, texto, links... envíamelo todo junto en un único mensaje.');
  })

  bot.on('message', async (ctx, next) => {
    if (ctx.chat.id === admissionsChatId) return await next();

    if ((ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
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

      const forwardedMessage = await ctx.forwardMessage(admissionsChatId);
      await ctx.telegram.sendMessage(
        admissionsChatId,
        buildFrom(ctx.message.from),
        { reply_to_message_id: forwardedMessage.message_id })
      return await ctx.reply("Recibido! Lo publicaremos tan pronto como podamos.");
    }

    await ctx.reply('No se de qué hablas UwU. Escribe /help y así nos entendemos.');
  })

}

function buildFrom(user: User) {
  if (user.username) return `Anuncio de @${user.username}`;
  return `Anuncio de ${user.first_name} ${user.last_name || ''} (id=${user.id})`;
}
