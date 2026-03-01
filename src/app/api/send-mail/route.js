import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export async function POST(request) {
  try {
    const body = await request.json()
    const { to, subject, text, html, from } = body

    const result = await sendMail({ to, subject, text, html, from })

    return NextResponse.json(
      {
        ok: true,
        messageId: result.messageId,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message ?? 'Failed to send email.',
      },
      { status: 400 }
    )
  }
}

