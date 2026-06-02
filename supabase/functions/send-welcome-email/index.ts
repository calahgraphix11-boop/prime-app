import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WELCOME_HTML = (firstName: string) => `
<div style="background:#001a10;color:#e8ead0;font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;border-radius:12px;">
  <h1 style="color:#F5A800;font-size:28px;margin-bottom:8px;">Welcome to Prime.</h1>
  <p style="color:#e8ead0;font-size:16px;margin-bottom:24px;">Hey ${firstName},</p>
  <p style="color:rgba(232,234,208,0.7);font-size:15px;line-height:1.7;">You just joined the study app built for students in Cameroon who are done settling for average.</p>
  <p style="color:rgba(232,234,208,0.7);font-size:15px;line-height:1.7;margin-top:16px;">You now have access to StudyPal, Exam Coach, Note Summarizer, Study Groups, Streaks, and The Grind Board.</p>
  <p style="color:rgba(232,234,208,0.7);font-size:15px;line-height:1.7;margin-top:16px;">We built this for you. Now go use it.</p>
  <p style="color:#F5A800;font-size:15px;margin-top:32px;">Study smarter,<br/>The Prime Team</p>
  <p style="color:rgba(232,234,208,0.3);font-size:12px;margin-top:32px;">primestudyapp.com</p>
</div>`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!req.headers.get('Authorization')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let userId: string, email: string, firstName: string
  try {
    ;({ userId, email, firstName } = await req.json())
    if (!userId || !email) throw new Error('Missing userId or email')
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const safeFirstName = firstName || email.split('@')[0]

  // Send welcome email via Resend
  const resendKey = Deno.env.get('RESEND_API_KEY') ?? ''
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Prime <noreply@primestudyapp.com>',
      to: [email],
      subject: "You're in. Welcome to Prime.",
      html: WELCOME_HTML(safeFirstName),
    }),
  })

  if (!emailRes.ok) {
    console.error('Resend error:', await emailRes.text())
  }

  // Insert in-app notification using the service role key to bypass RLS
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: userId,
    message: 'Welcome to Prime! Your 24-hour free trial is active. Go explore.',
    read: false,
    created_at: new Date().toISOString(),
  })

  if (notifError) console.error('Notification insert error:', notifError)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
