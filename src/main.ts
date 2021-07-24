import * as express from 'express';
import { Telegraf } from 'telegraf';
import { log } from './utils'

import admissions from './bots/admissions'
import reports from './bots/reports'

const bots: { [key: string]: (bot: Telegraf) => Promise<void> } = {
  admissions,
  reports
}

async function start() {
  log.info(`USE_WEBHOOKS = ${process.env.USE_WEBHOOKS}`);
  if (process.env.USE_WEBHOOKS === '1') {
    await startUsingWebhooks();
  } else {
    await startUsingPolling();
  }
}

async function startUsingWebhooks() {
  log.info('Using webhooks');
  const webhookURL = getRequiredEnvVar(`WEBHOOK_URL`);
  const app = express();

  for(const botName in bots) {
    const botNameUpper = botName.toUpperCase();
    const webhookPath = getRequiredEnvVar(`${botNameUpper}_WEBHOOK_PATH`);
    const bot = await initBot(botName);
    await bot.telegram.setWebhook(`${webhookURL}${webhookPath}`);
    app.use(bot.webhookCallback(webhookPath))
    log.info(`Bot ${botName} configured`);
  }

  const server = app.listen(80, '0.0.0.0', () => log.info('Webhooks listening'));
  const closeServer = (signal: string) => {
    log.info(`Closing http server after signal ${signal}`);
    server.close();
  }

  process.once('SIGINT', () => closeServer('SIGINT'))
  process.once('SIGTERM', () => closeServer('SIGTERM'))
}

async function startUsingPolling() {
  log.info('Using polling');
  const botsInstances: Telegraf[] = [];
  for(const botName in bots) {
    const bot = await initBot(botName);
    botsInstances.push(bot);
    await bot.launch();
    log.info(`Bot ${botName} launched`);
  }

  const closeBots = (signal: string) => {
    log.info(`Closing bots after signal ${signal}`);
    botsInstances.forEach(bot => bot.stop(signal));
  }

  process.once('SIGINT', () => closeBots('SIGINT'))
  process.once('SIGTERM', () => closeBots('SIGTERM'))
}

async function initBot(botName: string): Promise<Telegraf> {
  const botNameUpper = botName.toUpperCase();
  const botToken = getRequiredEnvVar(`${botNameUpper}_BOT_TOKEN`);
  const bot = new Telegraf(botToken);
  log.info(`Initializing bot ${botName}`);
  await bots[botName](bot);
  bot.catch((err, _) => {
    log.error(`Error on bot ${botName}:`, err);
  })
  return bot;
}

function getRequiredEnvVar(key: string): string {
  if (!process.env[key]) throw new Error(key + ' is missing');
  return process.env[key]!;
}

start().then(() => {}, (err) => log.error('Something went wrong:', err));
