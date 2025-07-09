const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'testtoken';

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const msg = entry?.messages?.[0];
  if (!msg || msg.type !== 'text') return res.sendStatus(200);

  const from = msg.from;
  const text = msg.text.body.trim();

  if (text === '10') {
    await sendText(from, '✅ 已为您转接人工客服，请稍等...');
  } else {
    await sendText(from, `欢迎！请选择：\n1️⃣ 查询订单\n2️⃣ 充值余额\n🔟 转人工客服`);
  }

  res.sendStatus(200);
});

async function sendText(to, message) {
  await axios.post(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message }
  }, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bot running on port ${port}`));
