#!/usr/bin/env node
// Combined notifier for Codex completion:
// - Feishu webhook (text)
// - Optional voice prompt via macOS `say`
// Config via env:
//   FEISHU_WEBHOOK_URL (or FEISHU_WEBHOOK)
//   FEISHU_SIGN_SECRET (optional)
//   CODEX_SPEAK (default 1)
//   CODEX_SPEAK_TEXT (default: 叮咚，有个任务完成了，请查阅)

import { spawn } from 'node:child_process'
import crypto from 'node:crypto'

const text = process.argv.slice(2).join(' ').trim() || process.env.CODEX_SPEAK_TEXT || '叮咚，有个任务完成了，请查阅'

async function notifyFeishu(msg) {
  const webhook = process.env.FEISHU_WEBHOOK_URL || process.env.FEISHU_WEBHOOK
  if (!webhook) return false
  const secret = process.env.FEISHU_SIGN_SECRET || ''
  const payload = { msg_type: 'text', content: { text: msg } }
  let body
  if (secret) {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const stringToSign = `${timestamp}\n${secret}`
    const sign = crypto.createHmac('sha256', secret).update(stringToSign).digest('base64')
    body = JSON.stringify({ ...payload, timestamp, sign })
  } else {
    body = JSON.stringify(payload)
  }
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    })
    let ok = res.ok
    try {
      const data = await res.json()
      if (typeof data?.StatusCode !== 'undefined') ok = ok && data.StatusCode === 0
      if (typeof data?.code !== 'undefined') ok = ok && data.code === 0
    } catch {}
    return ok
  } catch {
    return false
  }
}

async function speak(msg) {
  if (process.env.CODEX_SPEAK === '0') return false
  return new Promise((resolve) => {
    const cmd = process.platform === 'darwin' ? 'say' : null
    if (!cmd) return resolve(false)
    const p = spawn(cmd, [msg], { stdio: 'ignore' })
    p.on('close', () => resolve(true))
  })
}

await Promise.allSettled([notifyFeishu(text), speak(text)])
process.exit(0)
