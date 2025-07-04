
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message } = await req.json()
    
    console.log('Sending SMS to:', to)
    console.log('Message:', message)
    
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    console.log('Twilio Account SID:', TWILIO_ACCOUNT_SID ? 'Set' : 'Missing')
    console.log('Twilio Auth Token:', TWILIO_AUTH_TOKEN ? 'Set' : 'Missing')  
    console.log('Twilio Phone Number:', TWILIO_PHONE_NUMBER ? 'Set' : 'Missing')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio configuration:', {
        accountSid: !!TWILIO_ACCOUNT_SID,
        authToken: !!TWILIO_AUTH_TOKEN, 
        phoneNumber: !!TWILIO_PHONE_NUMBER
      })
      throw new Error('Missing Twilio configuration')
    }

    // Ensure phone number is in correct format (with + prefix)
    const formattedTo = to.startsWith('+') ? to : `+${to}`

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Twilio API error:', data)
      throw new Error(data.message || 'Failed to send SMS')
    }
    
    console.log('SMS sent successfully:', data.sid)
    
    return new Response(
      JSON.stringify({ success: true, messageId: data.sid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('SMS sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
