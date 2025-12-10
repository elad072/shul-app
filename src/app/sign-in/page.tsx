'use client';

import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const login = async () => {
    // בניית הכתובת ללא פורטים
    const redirectTo = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: "offline",
          
          // 🔥 כדי לבטל את הבחירה כל פעם - שים // בתחילת השורה למטה
          // 🔥 כדי להחזיר את הבחירה - מחק את ה-//
          prompt: "consent", 
        },
      },
    });
  };

  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>ברוך הבא לבית הכנסת "מעון קודשך"</h1>
      <h2>אנא התחבר כדי להמשיך</h2>
      <button 
        onClick={login}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        התחבר עם Google
      </button>
    </div>
  );
}
