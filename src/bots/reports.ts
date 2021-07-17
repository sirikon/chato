import { Telegraf } from 'telegraf';
import { getRequiredEnvVar } from '../utils'

export default function reports(bot: Telegraf) {
  console.log('Reports -- configuring');

  const reportsChatId: number = parseInt(getRequiredEnvVar('REPORTS_CHAT_ID'));

  bot.on('message', async (ctx, next) => {
    if (ctx.chat.id === reportsChatId) {
      const msg = (ctx.message as any);
      if (msg.reply_to_message && msg.reply_to_message.forward_from) {
        const target = (ctx.message as any).reply_to_message.forward_from.id;

        ctx.copyMessage(target);
      }
      return;
    }
    if (ctx.chat.type !== 'private') return await next();
    ctx.forwardMessage(reportsChatId);
  })

}
