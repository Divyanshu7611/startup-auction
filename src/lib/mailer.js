import sgMail from '@sendgrid/mail'

const globalForMailer = globalThis

function getSendGridClient() {
  if (globalForMailer.sendGridClient) {
    return globalForMailer.sendGridClient
  }

  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    throw new Error('Missing SendGrid configuration. Set SENDGRID_API_KEY in your environment variables.')
  }

  sgMail.setApiKey(apiKey)

  if (process.env.NODE_ENV !== 'production') {
    globalForMailer.sendGridClient = sgMail
  }

  return sgMail
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

  const client = getSendGridClient()

  const msg = {
    to,
    from: sender,
    subject,
    text,
    html,
  }

  try {
    const response = await client.send(msg)
    return response
  } catch (error) {
    console.error('SendGrid Error:', error)
    if (error.response) {
      console.error('SendGrid Error Body:', error.response.body)
    }
    throw error
  }
}
