import nodemailer from 'nodemailer'

const globalForMailer = globalThis

function getTransporter() {
  if (globalForMailer.emailTransporter) {
    return globalForMailer.emailTransporter
  }

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    throw new Error('Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment variables.')
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForMailer.emailTransporter = transporter
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

  const sender = from ?? process.env.MAIL_FROM
  
  if (!sender) {
    throw new Error('Missing "from" email address. Set MAIL_FROM in your environment variables.')
  }

  const transporter = getTransporter()

  const mailOptions = {
    from: sender,
    to,
    subject,
    text,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('SMTP Error:', error)
    throw error
  }
}
