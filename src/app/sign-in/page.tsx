'use client';

import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="card">
      <h1>ברוך הבא לבית הכנסת "מעון קודשך"</h1>
      <h2>אנא התחבר כדי להמשיך</h2>

      <button onClick={login}>התחבר עם Google</button>
    </div>
  );
}
