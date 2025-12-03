'use client'

import { createClient } from '../../lib/supabase' // שים לב לנתיב
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  profile: any
}

export default function ProfileForm({ profile }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // מונע רענון אוטומטי של הדף
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const updates = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      phone: formData.get('phone'),
      updated_at: new Date().toISOString(),
    }

    // 1. קבלת המשתמש הנוכחי
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 2. שמירה ישירה ב-Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        alert('שגיאה בשמירה: ' + error.message)
      } else {
        // 3. ריענון הדף כדי לראות את השם החדש למעלה
        router.refresh()
        alert('הפרטים נשמרו בהצלחה!')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">שם פרטי</label>
          <input 
            name="first_name" 
            type="text" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            defaultValue={profile?.first_name || ''} 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">שם משפחה</label>
          <input 
            name="last_name" 
            type="text" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            defaultValue={profile?.last_name || ''} 
          />
        </div>
      </div>

      <div>
          <label className="block text-sm text-gray-600 mb-1">מספר טלפון</label>
          <input 
            name="phone" 
            type="tel" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            defaultValue={profile?.phone || ''} 
          />
      </div>

      <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto disabled:opacity-50"
          >
              {loading ? 'שומר...' : 'שמור שינויים'}
          </button>
      </div>
    </form>
  )
}