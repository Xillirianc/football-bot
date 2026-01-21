const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.ADMIN_ID;

// Функция для безопасной загрузки JSON
function loadJSON(filename, defaultValue) {
  try {
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename));
    } else {
      fs.writeFileSync(filename, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
  } catch (e) {
    console.error(`Ошибка чтения ${filename}:`, e);
    return defaultValue;
  }
}

// Загружаем даты
let dates = loadJSON('dates.json', [
  "2026-01-25 18:00",
  "2026-01-25 20:00",
  "2026-01-26 18:00",
  "2026-01-26 20:00"
]);

// Загружаем бронирования
let bookings = loadJSON('bookings.json', []);

// Роут для получения дат
app.get('/dates', (req, res) => {
  res.json(dates);
});

// Роут для создания бронирования
app.post('/book', async (req, res) => {
  const data = req.body;

  // Сохраняем в bookings.json
  bookings.push(data);
  fs.writeFileSync('bookings.json', JSON.stringify(bookings, null, 2));

  // Отправка в Telegram
  if (BOT_TOKEN && CHAT_ID) {
    try {
      const msg = `Новая заявка:\nТел: ${data.phone}\nДата: ${data.date}\nМеста: ${data.places.join(', ')}\nСумма: ${data.total}\nФайл: ${data.file}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
      });
    } catch (e) {
      console.error("Ошибка отправки в Telegram:", e);
    }
  }

  res.json({ ok: true });
});

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('<h1>Сервер работает! Даты доступны по /dates</h1>');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
