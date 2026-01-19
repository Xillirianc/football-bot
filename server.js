const fs = require('fs');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const DATA_FILE = './dates.json';

app.get('/dates', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

bot.on('message', msg => {
  if (msg.chat.id.toString() !== ADMIN_ID) return;

  let dates = JSON.parse(fs.readFileSync(DATA_FILE));
  const text = msg.text;

  if (text.startsWith('/add')) {
    const value = text.replace('/add ', '');
    dates.push(value);
    fs.writeFileSync(DATA_FILE, JSON.stringify(dates));
    bot.sendMessage(msg.chat.id, 'Добавлено');
  }

  if (text.startsWith('/remove')) {
    const value = text.replace('/remove ', '');
    dates = dates.filter(d => d !== value);
    fs.writeFileSync(DATA_FILE, JSON.stringify(dates));
    bot.sendMessage(msg.chat.id, 'Удалено');
  }

  if (text === '/list') {
    bot.sendMessage(msg.chat.id, dates.join('\n') || 'Пусто');
  }
});

app.listen(3000);
