"use client";

import { submitOnboarding } from "./actions";

export default function Form({ profile }: { profile: any }) {
  return (
    <form action={submitOnboarding} className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <p style={{marginBottom: "20px"}}>
        שלום {profile?.first_name || "אורח"}, אנא השלם את פרטיך לרישום לבית הכנסת.
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          name="first_name"
          placeholder="שם פרטי"
          defaultValue={profile?.first_name || ""}
          required
          style={{ padding: "8px", flex: 1 }}
        />
        <input
          name="last_name"
          placeholder="שם משפחה"
          defaultValue={profile?.last_name || ""}
          required
          style={{ padding: "8px", flex: 1 }}
        />
      </div>

      <input
        name="phone"
        type="tel"
        placeholder="מספר טלפון"
        defaultValue={profile?.phone || ""}
        required
        style={{ padding: "8px", width: "100%" }}
      />

      <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
        <input type="checkbox" name="isGabbai" defaultChecked={profile?.is_gabbai || false} />
        <span>האם אתה גבאי?</span>
      </label>

      <button
        type="submit"
        style={{ 
          marginTop: "20px", padding: "10px", background: "#0070f3", color: "white", 
          border: "none", cursor: "pointer", borderRadius: "5px" 
        }}
      >
        שמור ושלח לאישור
      </button>
    </form>
  );
}
