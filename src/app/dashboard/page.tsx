'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(data);
      }
    }
    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  if (!user) return <div>טוען...</div>;

  return (
    <div className="card">
      <h1>ברוך הבא לבית הכנסת "מעון קודשך"</h1>
      <h2>פרטי המשתמש</h2>

      <p><strong>שם:</strong> {profile?.full_name || "לא זמין"}</p>
      <p><strong>אימייל:</strong> {user.email}</p>

      <button onClick={logout}>התנתק</button>
    </div>
  );
}
