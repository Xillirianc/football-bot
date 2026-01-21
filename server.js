const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.ADMIN_ID;

// Загружаем даты из файла
let dates = [];
try { dates = JSON.parse(fs.readFileSync('dates.json')); } catch(e){ dates = ["2026-01-25 18:00","2026-01-25 20:00"]; }

let bookings = [];
try { bookings = JSON.parse(fs.readFileSync('bookings.json')); } catch(e){ bookings = []; }

app.get('/dates',(req,res)=>{ res.json(dates); });

app.post('/book', async(req,res)=>{
  const data = req.body;
  bookings.push(data);
  fs.writeFileSync('bookings.json',JSON.stringify(bookings,null,2));

  // Отправка в Telegram
  let msg = `Новая заявка:\nТел: ${data.phone}\nДата: ${data.date}\nМеста: ${data.places.join(', ')}\nСумма: ${data.total}\nФайл: ${data.file}`;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: CHAT_ID, text: msg})
  });

  res.json({ok:true});
});

app.listen(3000,()=>console.log('Server running on port 3000'));
