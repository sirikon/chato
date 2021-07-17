import * as express from 'express';
import { Telegraf } from 'telegraf';

import admissions from './bots/admissions'
import reports from './bots/reports'

const bots: { [key: string]: (bot: Telegraf) => void } = {
  admissions,
  reports
}

async function start() {
  if (process.env.USE_WEBHOOKS === '1') {
    await startUsingWebhooks();
  } else {
    await startUsingPolling();
  }
}

async function startUsingWebhooks() {
  console.log('Using webhooks');
  const webhookURL = getRequiredEnvVar(`WEBHOOK_URL`);
  const app = express();

  for(const botName in bots) {
    const botNameUpper = botName.toUpperCase();
    const webhookPath = getRequiredEnvVar(`${botNameUpper}_WEBHOOK_PATH`);
    const bot = initBot(botName);
    await bot.telegram.setWebhook(`${webhookURL}${webhookPath}`);
    app.use(bot.webhookCallback(webhookPath))
    console.log(`Bot ${botName} configured`);
  }

  const server = app.listen(80, '0.0.0.0', () => console.log('Webhooks listening'));

  process.once('SIGINT', () => server.close())
  process.once('SIGTERM', () => server.close())
}

async function startUsingPolling() {
  console.log('Using polling');
  const botsInstances: Telegraf[] = [];
  for(const botName in bots) {
    const bot = initBot(botName);
    botsInstances.push(bot);
    await bot.launch();
    console.log(`Bot ${botName} launched`);
  }
  process.once('SIGINT', () => botsInstances.forEach(bot => bot.stop('SIGINT')))
  process.once('SIGTERM', () => botsInstances.forEach(bot => bot.stop('SIGTERM')))
}

function initBot(botName: string): Telegraf {
  const botNameUpper = botName.toUpperCase();
  const botToken = getRequiredEnvVar(`${botNameUpper}_BOT_TOKEN`);
  const bot = new Telegraf(botToken);
  bots[botName](bot);
  bot.catch((err, _) => {
    console.log(`Error on bot ${botName}`, err);
  })
  return bot;
}

function getRequiredEnvVar(key: string): string {
  if (!process.env[key]) throw new Error(key + ' is missing');
  return process.env[key]!;
}

start().then(() => {}, (err) => console.log(err));
