import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      console.log('User authenticated:', session.user.id)

      // Store the session object (containing the token) in a cookie
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7) // Set cookie to expire in 7 days

      const cookiesInstance = await cookies() // Get the cookies object
      await cookiesInstance.set('supabase_session', JSON.stringify(session), { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        expires: expiry 
      })
    }
  }

  // Redirect to the dashboard or another appropriate page
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}