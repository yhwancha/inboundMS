import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const { containerNumber, phoneNumber } = await request.json()

    console.log('=== SMS API Called ===')
    console.log('Container Number:', containerNumber)
    console.log('Phone Number:', phoneNumber)

    // Validate input
    if (!containerNumber || !phoneNumber) {
      console.error('Missing required fields')
      return NextResponse.json(
        { error: 'Container number and phone number are required' },
        { status: 400 }
      )
    }

    // Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
    const notificationPhoneNumber = process.env.NOTIFICATION_PHONE_NUMBER

    console.log('Twilio Config Check:')
    console.log('- Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'MISSING')
    console.log('- Auth Token:', authToken ? 'SET' : 'MISSING')
    console.log('- Twilio Phone:', twilioPhoneNumber)
    console.log('- Notification Phone:', notificationPhoneNumber)

    // Check if Twilio is configured
    if (!accountSid || !authToken || !twilioPhoneNumber || !notificationPhoneNumber) {
      console.log('⚠️ Twilio not fully configured. SMS details:', {
        containerNumber,
        phoneNumber,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        success: true,
        message: 'Check-in recorded (SMS not configured)',
        data: { containerNumber, phoneNumber }
      })
    }

    // Initialize Twilio client
    console.log('Initializing Twilio client...')
    const client = twilio(accountSid, authToken)

    // Format the message
    const message = `
컨테이너 번호 ${containerNumber}가 체크인 되었습니다!

연락처: ${phoneNumber}
시간: ${new Date().toLocaleString('ko-KR', { 
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `.trim()

    // Send SMS via Twilio
    console.log('Sending SMS...')
    console.log('- From:', twilioPhoneNumber)
    console.log('- To:', notificationPhoneNumber)
    console.log('- Message:', message)
    
    const smsResponse = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: notificationPhoneNumber
    })

    console.log('✅ SMS sent successfully!')
    console.log('- Message SID:', smsResponse.sid)
    console.log('- Status:', smsResponse.status)

    return NextResponse.json({
      success: true,
      message: 'SMS notification sent successfully',
      data: {
        containerNumber,
        phoneNumber,
        messageSid: smsResponse.sid
      }
    })

  } catch (error: any) {
    console.error('Error sending SMS:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send SMS notification',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

