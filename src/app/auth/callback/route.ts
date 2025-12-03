import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // --- כאן השינוי הגדול ---
  // הדבק כאן את הכתובת שהעתקת משלב 1 (בתוך הגרשיים)
  // וודא שאין לוכסן (/) בסוף הכתובת!
  const mySiteUrl = 'https://potential-couscous-wxq657vwjrf95rg-3000.app.github.dev' 
  // -----------------------

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // עכשיו אנחנו מפנים לכתובת הקבועה שהגדרנו
      return NextResponse.redirect(`${mySiteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${mySiteUrl}/auth/auth-code-error`)
}