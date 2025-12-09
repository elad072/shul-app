"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import { addMember } from "@/lib/actions/addMember";

export default function MembersTest() {
  const [token, setToken] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token ?? "");
    }
    load();
  }, []);

  return (
    <form
      action={(formData) =>
        start(async () => {
          formData.append("token", token);
          await addMember(formData); // ✔ זה עובד
        })
      }
    >
      <input name="first_name" placeholder="שם" required />
      <input name="last_name" placeholder="משפחה" required />
      <button disabled={pending}>שלח</button>
    </form>
  );
}
