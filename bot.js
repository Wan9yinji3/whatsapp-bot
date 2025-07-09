/**
 * WhatsApp Cloud API – 简易 Bot (CommonJS 版)
 * Node 18+ 直接运行，无需 type:module
 */

const express = require('express');
const axios   = require('axios');
const app = express();
app.use(express.json());

// ─────── 环境变量 ───────
const TOKEN        = process.env.WHATSAPP_TOKEN;          // 永久/测试令牌
const PHONE_ID     = process.env.PHONE_ID;                // 业务手机号 ID
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'testtoken';

// ─────── Webhook 验证 ───────
app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅  Webhook 验证成功');
    return res.status(200).send(challenge);
  }
  console.warn('❌  Webhook 验证失败');
  return res.sendStatus(403);
});

// ─────── 接收消息 ───────
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);               // 先秒回 200，避免 Meta 重试

  try {
    const entry  = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const msg    = change?.messages?.[0];
    if (!msg || msg.type !== 'text') return;           // 只处理文本

    const from = msg.from;
    const text = msg.text.body.trim();
    console.log('📥', from, text);

    let reply = `Echo: ${text}`;
    if (text === '10') reply = '✅ 已为您转接人工，请稍等...';

    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: reply }
      },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    console.log('📤 已回复 ->', reply);
  } catch (err) {
    console.error('❌  处理消息出错：',
      err.response?.data || err.message);
  }
});

// ─────── 启动 ───────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on ${PORT}`));
