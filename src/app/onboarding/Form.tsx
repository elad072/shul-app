"use client";

import { submitOnboarding } from "./actions";

import { useFormStatus } from "react-dom";

export default function Form({ profile }: { profile: any }) {
  return (
    <form action={submitOnboarding} className="flex flex-col gap-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="first_name"
          placeholder="שם פרטי"
          defaultValue={profile?.first_name || ""}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        />

        <input
          name="last_name"
          placeholder="שם משפחה"
          defaultValue={profile?.last_name || ""}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        />
      </div>

      <input
        name="phone"
        type="tel"
        placeholder="מספר טלפון"
        defaultValue={profile?.phone || ""}
        required
        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
      />

      <SubmitButton />

    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>שולח...</span>
        </>
      ) : (
        <span>שמור ושלח לאישור</span>
      )}
    </button>
  );
}
