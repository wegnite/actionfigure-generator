#!/usr/bin/env node
// Deploy to Cloudflare (OpenNext) and notify on success/failure.
// - Email via Resend if RESEND_API_KEY and RESEND_SENDER_EMAIL are set
// - Fallback: webhook via DEPLOY_NOTIFY_WEBHOOK (Slack/Discord-compatible JSON)
// - Always emits a terminal bell and tries macOS notification with sound

import { spawn } from 'node:child_process'
import os from 'node:os'

function bell() {
  try { process.stdout.write('\x07') } catch {}
}

async function macNotify(title, subtitle, sound = 'Glass') {
  if (process.platform !== 'darwin') return
  const script = `display notification \"${subtitle}\" with title \"${title}\" sound name \"${sound}\"`
  await new Promise((resolve) => {
    const p = spawn('osascript', ['-e', script])
    p.on('close', () => resolve())
  })
}

async function sendWebhook(payload) {
  const url = process.env.DEPLOY_NOTIFY_WEBHOOK
  if (!url) return false
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch (_) {
    return false
  }
}

async function sendResendEmail({ subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_SENDER_EMAIL
  const toRaw = process.env.ADMIN_EMAILS || ''
  const to = toRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!apiKey || !from || to.length === 0) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    return res.ok
  } catch (_) {
    return false
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts })
    child.on('close', (code) => resolve(code ?? 1))
  })
}

const startedAt = new Date()
const host = os.hostname()

// Run underlying OpenNext Cloudflare build + deploy directly
const exitCode = await run('opennextjs-cloudflare', ['build', '&&', 'opennextjs-cloudflare', 'deploy'])

const finishedAt = new Date()
const ms = finishedAt.getTime() - startedAt.getTime()
const seconds = Math.round(ms / 1000)

const status = exitCode === 0 ? 'SUCCESS' : 'FAIL'
const subject = `[Deploy ${status}] Cloudflare OpenNext — ${host}`
const text = `Status: ${status}\nHost: ${host}\nStarted: ${startedAt.toISOString()}\nFinished: ${finishedAt.toISOString()}\nDuration: ${seconds}s\nCommand: opennextjs-cloudflare build && opennextjs-cloudflare deploy\n`
const html = `
  <h3>Cloudflare Deploy ${status}</h3>
  <p><b>Host:</b> ${host}</p>
  <p><b>Started:</b> ${startedAt.toISOString()}</p>
  <p><b>Finished:</b> ${finishedAt.toISOString()}</p>
  <p><b>Duration:</b> ${seconds}s</p>
  <p><b>Command:</b> <code>opennextjs-cloudflare build && opennextjs-cloudflare deploy</code></p>
`

await sendWebhook({ text: subject, status, host, startedAt, finishedAt, durationSec: seconds })
await sendResendEmail({ subject, html, text })

bell()
await macNotify('Cloudflare Deploy', `Deploy ${status} (${seconds}s)`, status === 'SUCCESS' ? 'Glass' : 'Basso')

process.exit(exitCode)

