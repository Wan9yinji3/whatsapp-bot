/**
 * WhatsApp Cloud API – 简易 Bot
 * 部署环境：Node 18+
 * 环境变量：WHATSAPP_TOKEN / PHONE_ID / VERIFY_TOKEN
 */

import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// ────────── 环境变量 ──────────
const TOKEN        = process.env.WHATSAPP_TOKEN;      // 永久或临时令牌
const PHONE_ID     = process.env.PHONE_ID;            // WhatsApp Business Phone Number ID
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'testtoken'; // 自定义

// ────────── 路由：Webhook 验证 ──────────
app.get('/webhook', (req, res) => {
  const mode  = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅  Webhook 验证成功');
    return res.status(200).send(challenge);
  }
  console.warn('❌  Webhook 验证失败：Token 不匹配');
  return res.sendStatus(403);
});

// ────────── 路由：接收消息 ──────────
app.post('/webhook', async (req, res) => {
  // Meta 要求 200 立即返回，避免重试
  res.sendStatus(200);

  try {
    const entry  = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const msgObj = change?.messages?.[0];

    if (!msgObj || msgObj.type !== 'text') return; // 只处理 text

    const from = msgObj.from;          // 发送者号码（不带 +）
    const text = msgObj.text?.body?.trim();
    console.log('📥 收到 ->', from, text);

    // ① 这里可按需改成关键词匹配
    let replyText = `Echo: ${text}`;

    // ② 示例：如果用户输入 10，转接人工
    if (text === '10') replyText = '✅ 已为您转接人工，请稍等...';

    await sendText(from, replyText);
    console.log('📤 已回复 ->', from, replyText);
  } catch (err) {
    console.error('❌  处理消息出错：', err.response?.data || err.message);
  }
});

// ────────── 工具函数：发文本 ──────────
async function sendText(to, message) {
  return axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// ────────── 启动 ──────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot running on port ${PORT}`);
});
