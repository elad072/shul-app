"use client";

import { submitOnboarding } from "./actions";

export default function Form({ profile }: { profile: any }) {
  return (
    <form action={submitOnboarding} className="flex flex-col gap-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="first_name"
          placeholder="שם פרטי"
          defaultValue={profile?.first_name || ""}
          required
          className="input"
        />

        <input
          name="last_name"
          placeholder="שם משפחה"
          defaultValue={profile?.last_name || ""}
          required
          className="input"
        />
      </div>

      <input
        name="phone"
        type="tel"
        placeholder="מספר טלפון"
        defaultValue={profile?.phone || ""}
        required
        className="input"
      />

      <button
        type="submit"
        className="btn-primary w-full mt-6"
      >
        שמור ושלח לאישור
      </button>

    </form>
  );
}
