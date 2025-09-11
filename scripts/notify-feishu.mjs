#!/usr/bin/env node
// Send a Feishu(Lark) custom bot message via incoming webhook.
// Usage:
//   FEISHU_WEBHOOK_URL=... [FEISHU_SIGN_SECRET=...] node scripts/notify-feishu.mjs "消息文本"
// Notes:
// - If FEISHU_SIGN_SECRET is set, we compute v2 signature: sign = base64(HMAC_SHA256(secret, `${timestamp}\n${secret}`)).
// - msg_type: text

import crypto from 'node:crypto'

const webhook = process.env.FEISHU_WEBHOOK_URL || process.env.FEISHU_WEBHOOK
if (!webhook) {
  console.error('FEISHU_WEBHOOK_URL is required')
  process.exit(2)
}

const secret = process.env.FEISHU_SIGN_SECRET || ''
const text = process.argv.slice(2).join(' ').trim() || '工作完成，请查阅'

const payload = { msg_type: 'text', content: { text } }

let body
if (secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const stringToSign = `${timestamp}\n${secret}`
  const sign = crypto.createHmac('sha256', secret).update(stringToSign).digest('base64')
  body = JSON.stringify({ ...payload, timestamp, sign })
} else {
  body = JSON.stringify(payload)
}

const res = await fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
})

if (!res.ok) {
  const t = await res.text().catch(() => '')
  console.error('Feishu notify failed:', res.status, t)
  process.exit(1)
}

process.exit(0)

