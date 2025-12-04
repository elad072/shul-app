import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // יצירת תגובה ראשונית
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // הגדרת הקליינט של Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // בדיקת המשתמש מול Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // הגדרת נתיבים
  const path = request.nextUrl.pathname
  const isAuthRoute = path.startsWith('/auth')
  const isLoginRoute = path === '/login'
  const isWaitingRoom = path === '/waiting-room'
  const isStaticAsset = path.match(/\.(.*)$/) // תמונות, CSS וכו'

  // אם זה קובץ סטטי או דף לוגין - שחרר
  if (isStaticAsset || isAuthRoute || isLoginRoute) {
    return response
  }

  // אם אין משתמש מחובר -> זרוק ללוגין
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // שליפת הסטטוס מהפרופיל
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  // לוגיקה: אם המשתמש בהמתנה והוא לא בחדר המתנה -> זרוק לחדר המתנה
  if (profile?.status === 'pending' && !isWaitingRoom) {
    return NextResponse.redirect(new URL('/waiting-room', request.url))
  }

  // לוגיקה: אם המשתמש מאושר והוא מנסה להיכנס לחדר המתנה -> זרוק לדאשבורד
  if (profile?.status === 'approved' && isWaitingRoom) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // לוגיקה: אם המשתמש נדחה (אופציונלי)
  if (profile?.status === 'rejected' && !isWaitingRoom) {
     return NextResponse.redirect(new URL('/waiting-room', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}