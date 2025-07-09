/**
 * WhatsApp Cloud API – 简易菜单 Bot
 * --------------------------------------------------
 * Env required:
 *  WHATSAPP_TOKEN   永久或临时访问令牌
 *  PHONE_ID         “WhatsApp 业务帐号 > 电话号码 ID”
 *  VERIFY_TOKEN     任意自定义字符串（与 Meta Webhook 一致）
 *  PORT             (可选) 默认 3000
 */
const express = require('express');
const axios   = require('axios');

const app           = express();
const VERIFY_TOKEN  = process.env.VERIFY_TOKEN  || 'testtoken';
const ACCESS_TOKEN  = process.env.WHATSAPP_TOKEN;
const PHONE_ID      = process.env.PHONE_ID;
const API_URL       = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;

app.use(express.json());

/* 1) Webhook 验证 */
app.get('/webhook', (req, res) => {
  const { ['hub.mode']: mode, ['hub.verify_token']: token, ['hub.challenge']: challenge } = req.query;
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

/* 2) 消息处理 */
app.post('/webhook', async (req, res) => {
  try {
    const change = req.body?.entry?.[0]?.changes?.[0];
    const msg    = change?.value?.messages?.[0];
    if (!msg || msg.type !== 'text') return res.sendStatus(200);

    const from = msg.from;                 // 发送者号码
    const body = msg.text.body.trim();     // 文本内容

    // --- 路由逻辑 ---
    switch (body) {
      case '1':
      case '1️⃣':
        await sendText(from, '🛒 *Productos Latinos y Rumanos*\nVisítanos para conocer toda la variedad de productos 🇲🇽🇨🇴🇷🇴');
        break;
      case '2':
      case '2️⃣':
        await sendText(from, '📦 *Paquetería*\nEnvíos nacionales e internacionales. Consulta precios y tiempos de entrega.');
        break;
      case '3':
      case '3️⃣':
        await sendText(from, '📱 *Recarga de Móvil*\nIndícanos tu compañía y el importe a recargar.');
        break;
      case '4':
      case '4️⃣':
        await sendText(from, '🕒 *Horario*\nL-S 09:00-21:00  •  D 10:00-18:00\n📍 *Ubicación*\nCalle Ejemplo 123, Madrid');
        break;
      case '5':
      case '5️⃣':
        await sendText(from, '🙋‍♀️ Un asesor te atenderá en breve. ¡Gracias por tu paciencia!');
        break;
      default:
        // 未识别内容 -> 发送问候 + 菜单
        await sendText(
          from,
          '👋 ¡Hola! Bienvenid@ a *[Nombre de tu tienda]* 🛒\n' +
          'Soy tu asistente automático. ¿En qué puedo ayudarte?\n\n' +
          '1️⃣ Productos\n' +
          '2️⃣ Paquetería 📦\n' +
          '3️⃣ Recarga de Móvil 📱\n' +
          '4️⃣ Horario y Ubicación 🕒📍\n' +
          '5️⃣ Hablar con una persona 🙋‍♀️\n' +
          'Si necesitas atención personalizada, te respondemos lo antes posible.'
        );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ 处理消息出错:', err.response?.data || err);
    res.sendStatus(500);
  }
});

/* ------------- 工具函数 ------------- */
async function sendText(to, text) {
  return axios.post(
    API_URL,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    },
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  ).catch(err => {
    console.error('❌ 发送失败:', err.response?.data || err);
  });
}

/* 启动 */
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Bot online · http://localhost:${port}`));
