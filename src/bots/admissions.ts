import { Telegraf, Context } from 'telegraf';
import { User, Update } from 'telegraf/typings/core/types/typegram';
import { getRequiredEnvVar, log } from '../utils'

const admissionsChatId: number = parseInt(getRequiredEnvVar('ADMISSIONS_CHAT_ID'));
const expectAnuncioIndex: { [key: number]: boolean } = {};

const commands = [
  ['anuncio', 'Dame anuncios para publicar.'],
  ['help', 'Muestra la ayuda.']
];

export default async function admissions(bot: Telegraf) {
  await setCommands(bot);

  ignoreAdmissionsChat(bot)
  groupChatEasterEgg(bot)

  helpCommand(bot);
  adsCommand(bot);

  fallback(bot);
}

async function setCommands(bot: Telegraf) {
  await bot.telegram.setMyCommands(commands
    .map(([command, description]) => ({ command, description })))
}

function ignoreAdmissionsChat(bot: Telegraf) {
  bot.on('message', async (ctx, next) => {
    if (!isAdmissionsChat(ctx)) await next();
  });
}

function groupChatEasterEgg(bot: Telegraf) {
  bot.on('message', async (ctx, next) => {
    if (!isUnknownGroupChat(ctx)) return await next();

    try {
      await ctx.replyWithHTML('<b>UH UH - AH AHH!</b>');
      await ctx.replyWithSticker('CAACAgQAAxkBAAN-YPLo_EkUjqprsIzE_ub1Jlipt8wAAtQNAAJmbahSt-tZ1rrO9kggBA');
      // await ctx.replyWithAudio('AwACAgQAAxkBAAOAYPLqHZ85FBoyKpmhynS-vQl3HF8AAjwIAAK6UJlTZ5anJo_44N0gBA');
      await ctx.replyWithHTML('YEET!');
      await ctx.reply('https://youtu.be/c1s3Iekns9k');
      await ctx.leaveChat();
      log.info('YEETed group', { group: ctx.chat });
    } catch(error) {
      if (error.message.indexOf('bot is not a member') === -1) {
        log.error(`Error while YEETing group=${ctx.chat.id}:`, error);
        throw error;
      }
    }
  });
}

function helpCommand(bot: Telegraf) {

  bot.command('help', async (ctx) => {
    const commands = [
      ['anuncio', 'Dame anuncios para publicar.'],
      ['help', 'Muestra la ayuda.']
    ];

    const introduction =
      '<b>Henlo</b>. Soy Chato, el monete que acepta los anuncios para Monke Bazar.';

    await ctx.replyWithHTML([
      introduction,
      '',
      ...commands.map(([command, description]) => `/${command} - ${description}`)
    ].join('\n'));
  });

}

function adsCommand(bot: Telegraf) {

  bot.command('anuncio', async (ctx) => {
    expectAnuncioIndex[ctx.chat.id] = true;
    return await ctx.reply(
      'Mándame el anuncio! Si quieres que tenga una imagen, texto, links... envíamelo todo junto en un único mensaje.');
  });

  bot.on('message', async (ctx, next) => {
    if (!expectAnuncioIndex[ctx.chat.id]) return await next();

    expectAnuncioIndex[ctx.chat.id] = false;

    const forwardedMessage = await ctx.forwardMessage(admissionsChatId);
    await ctx.telegram.sendMessage(
      admissionsChatId,
      buildFrom(ctx.message.from),
      { reply_to_message_id: forwardedMessage.message_id, parse_mode: 'HTML' })
    return await ctx.reply("Recibido! Vamos a revisarlo y enviarlo en cuanto podamos.");
  })

}

function fallback(bot: Telegraf) {
  bot.on('message', async (ctx) => {
    await ctx.reply('No se de qué hablas UwU. Escribe /help y así nos entendemos.');
  })
}

function isAdmissionsChat(ctx: Context<Update>) {
  if (!ctx.chat) return false;
  return ctx.chat.id === admissionsChatId;
}

function isUnknownGroupChat(ctx: Context<Update>) {
  if (!ctx.chat) return false;
  if (isAdmissionsChat(ctx)) return false;
  if (ctx.chat.type === 'private') return false;
  return true;
}

function buildFrom(user: User) {
  const userDisplayName = user.username || (`${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`);
  const userLink = `<a href="tg://user?id=${user.id}">${userDisplayName}</a>`
  return `Anuncio de ${userLink}`;
}
