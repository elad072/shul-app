'use client'

import { createClient } from '../lib/supabase'

export default function Home() {
  const supabase = createClient()

  const handleLogin = async () => {
    // כרגע רק נדפיס לקונסול שהכפתור עובד
    console.log("מנסה להתחבר...")
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    
    if (error) console.error("שגיאה:", error)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">ברוכים הבאים</h1>
        <p className="text-gray-600 mb-8">מערכת ניהול בית הכנסת</p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
        >
          <span>התחבר באמצעות Google</span>
        </button>
      </div>
    </div>
  )
}