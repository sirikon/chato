import { Telegraf } from 'telegraf';
import { getRequiredEnvVar } from '../utils'

const reportsChatId: number = parseInt(getRequiredEnvVar('REPORTS_CHAT_ID'));

export default async function reports(bot: Telegraf) {
  forwardPrivateMessagesToReportsChat(bot);
  forwardReportsRepliesToPrivateChat(bot);
}

function forwardPrivateMessagesToReportsChat(bot: Telegraf) {
  bot.on('message', async (ctx, next) => {
    if (ctx.chat.type !== 'private') return await next();
    await ctx.forwardMessage(reportsChatId);
  });
}

function forwardReportsRepliesToPrivateChat(bot: Telegraf) {
  bot.on('message', async (ctx, next) => {
    if (ctx.chat.id !== reportsChatId) return await next();

    const msg = (ctx.message as any);
    if (messageIsReplyingAForwardedMessage(msg)) {
      const target = (ctx.message as any).reply_to_message.forward_from.id;
      await ctx.copyMessage(target);
    }
  });
}

function messageIsReplyingAForwardedMessage(msg: any) {
  return msg.reply_to_message && msg.reply_to_message.forward_from;
}
