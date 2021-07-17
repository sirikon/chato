import { Telegraf } from 'telegraf';

export default function falafel(bot: Telegraf) {

  bot.on('message', async (ctx) => {
    ctx.reply('UwU');
  })

}
