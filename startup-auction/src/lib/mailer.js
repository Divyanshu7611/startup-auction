import nodemailer from 'nodemailer'

const globalForMailer = globalThis

function getTransporter() {
  if (globalForMailer.mailTransporter) {
    return globalForMailer.mailTransporter
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForMailer.mailTransporter = transporter
  }

  return transporter
}

export async function sendMail({ to, subject, text, html, from }) {
  if (!to || !subject) {
    throw new Error('Missing "to" or "subject".')
  }

  if (!text && !html) {
    throw new Error('Provide at least one of "text" or "html".')
  }

  const sender = from ?? process.env.MAIL_FROM ?? process.env.SMTP_USER
  const transporter = getTransporter()

  return transporter.sendMail({
    from: sender,
    to,
    subject,
    text,
    html,
  })
}
