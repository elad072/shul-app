"use client";

import { User, Baby, Calendar } from "lucide-react";
import { formatGregorianDate } from "@/lib/hebrewUtils";

type Member = {
  id: string;
  first_name: string;
  last_name?: string;
  role: "head" | "spouse" | "child";
  hebrew_birth_date?: string;
  birth_date?: string;
  created_at?: string;
};

export default function FamilyPanel({ members = [] }: { members: Member[] }) {
  const head = members.find(m => m.role === "head");
  const spouse = members.find(m => m.role === "spouse");
  const children = members.filter(m => m.role === "child");

  const Row = ({ m }: { m: Member }) => (
    <div className="flex justify-between items-start gap-3 py-2">
      <div>
        <p className="font-medium text-slate-800">
          {m.first_name} {m.last_name || ""}
        </p>

        <p className="text-xs text-slate-500">
          {m.hebrew_birth_date || "—"}
          {m.birth_date && ` · ${formatGregorianDate(m.birth_date)}`}
        </p>
      </div>

      {m.created_at && (
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <Calendar size={12} />
          {new Date(m.created_at).toLocaleDateString("he-IL")}
        </div>
      )}
    </div>
  );

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      <h2 className="text-lg font-bold text-slate-800">המשפחה שלי</h2>

      {/* אב משפחה */}
      {head && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
            <User size={16} /> אב משפחה
          </h3>
          <Row m={head} />
        </section>
      )}

      {/* בת זוג */}
      {spouse && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-700 mb-2">
            <User size={16} /> בת זוג
          </h3>
          <Row m={spouse} />
        </section>
      )}

      {/* ילדים */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
          <Baby size={16} /> ילדים
        </h3>

        {children.length === 0 && (
          <p className="text-xs text-slate-400">לא נוספו ילדים</p>
        )}

        <div className="divide-y">
          {children.map(c => (
            <Row key={c.id} m={c} />
          ))}
        </div>
      </section>
    </aside>
  );
}
