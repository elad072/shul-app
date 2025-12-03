import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm' // <--- הייבוא החדש

export default async function Dashboard() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-10 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">
            שלום, {profile?.first_name || 'מתפלל יקר'}
          </h1>
          <form action="/auth/signout" method="post">
            <button className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 font-bold">
              התנתק
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold mb-2">הסטטוס שלך</h2>
          <div className="flex gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center w-32">
              <span className="block text-sm text-gray-500">תפקיד</span>
              <span className="font-bold text-blue-700">
                {profile?.is_gabbai ? 'גבאי ראשי' : 'מתפלל'}
              </span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center w-32">
              <span className="block text-sm text-gray-500">סוג</span>
              <span className="font-bold text-green-700">
                {profile?.member_type === 'israel' ? 'ישראל' : profile?.member_type}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">עדכון פרטים אישיים</h2>
          
          {/* כאן אנחנו משתמשים בקומפוננטה החדשה ומעבירים לה את הנתונים */}
          <ProfileForm profile={profile} />
          
        </div>

      </div>
    </div>
  )
}