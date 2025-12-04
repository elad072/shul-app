import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // בדיקה בטרמינל שהקובץ בכלל רץ
  console.log(`[Middleware] Checking request: ${request.nextUrl.pathname}`);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  
  // נתיבים פתוחים
  if (path.startsWith('/_next') || path.startsWith('/auth') || path === '/login' || path.includes('.')) {
    return response
  }

  // 1. האם יש משתמש מחובר?
  if (!user) {
    console.log('[Middleware] No user found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. שליפת פרופיל
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  console.log(`[Middleware] User: ${user.email}, Status: ${profile?.status}, Error: ${error?.message}`);

  const isWaitingRoom = path === '/waiting-room'

  // 3. חסימה
  // אם אין פרופיל, או שהסטטוס הוא PENDING - חסום!
  if ((!profile || profile.status === 'pending') && !isWaitingRoom) {
    console.log('[Middleware] BLOCKING USER -> Redirecting to Waiting Room');
    return NextResponse.redirect(new URL('/waiting-room', request.url))
  }

  // אם המשתמש מאושר ומנסה להיכנס לחדר המתנה - העבר לדאשבורד
  if (profile?.status === 'approved' && isWaitingRoom) {
    console.log('[Middleware] User approved -> Redirecting to Dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}