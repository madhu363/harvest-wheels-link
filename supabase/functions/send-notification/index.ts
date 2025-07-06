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
    const { to, message, type = 'booking_update' } = await req.json()
    
    console.log('Sending notification to:', to)
    console.log('Message:', message)
    
    // Initialize NotificationAPI
    const notificationApiUrl = 'https://api.notificationapi.com/v1/notifications'
    const clientId = 'qjguypk3hiz0co3xs3l54yieez'
    const clientSecret = '1le6jj7t0js7nh6zy6gwvvzkbcwq2idbt53pzd4iz6chv1gfpg4cjsnwqo'
    
    const auth = btoa(`${clientId}:${clientSecret}`)
    
    const notificationPayload = {
      type: 'push',
      to: {
        id: to.email,
        email: to.email,
        number: to.phone
      },
      parameters: {
        message: message,
        type: type,
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('Sending notification payload:', JSON.stringify(notificationPayload, null, 2))
    
    const response = await fetch(notificationApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationPayload)
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('NotificationAPI error:', data)
      throw new Error(data.message || 'Failed to send notification')
    }
    
    console.log('Notification sent successfully:', data)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Notification sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})