"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Calendar, User, Baby } from "lucide-react";

import AddMemberModal from "@/app/components/dashboard/AddMemberModal";
import AddEventModal from "@/app/components/dashboard/AddEventModal";
import {
  getFamilyMembers,
  deleteFamilyMember,
} from "@/app/components/dashboard/familyActions";

export default function FamilyClient({
  initialMembers,
}: {
  initialMembers: any[];
}) {
  const [members, setMembers] = useState(initialMembers);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventMember, setEventMember] = useState<any>(null);

  async function refresh() {
    const data = await getFamilyMembers();
    setMembers(data || []);
  }

  const parents = members.filter(
    (m) => m.role === "head" || m.role === "spouse"
  );
  const children = members.filter((m) => m.role === "child");

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">המשפחה שלי</h1>
          <p className="text-slate-500">ניהול בני משפחה ואירועים</p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setMemberModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold"
        >
          <Plus size={18} />
          הוסף בן משפחה
        </button>
      </div>

      {/* Parents */}
      <Section
        title="הורים"
        icon={<User size={18} />}
        members={parents}
        allowDelete={(m) => m.role !== "head"}
        onAddEvent={(m) => {
          setEventMember(m);
          setEventModalOpen(true);
        }}
        onEdit={(m) => {
          setEditingMember(m);
          setMemberModalOpen(true);
        }}
        onDelete={async (m) => {
          if (!confirm(`למחוק את ${m.first_name}?`)) return;
          await deleteFamilyMember(m.id);
          refresh();
        }}
      />

      {/* Children */}
      <Section
        title="ילדים"
        icon={<Baby size={18} />}
        members={children}
        allowDelete={() => true}
        empty="עדיין לא הוספת ילדים"
        onAddEvent={(m) => {
          setEventMember(m);
          setEventModalOpen(true);
        }}
        onEdit={(m) => {
          setEditingMember(m);
          setMemberModalOpen(true);
        }}
        onDelete={async (m) => {
          if (!confirm(`למחוק את ${m.first_name}?`)) return;
          await deleteFamilyMember(m.id);
          refresh();
        }}
      />

      {/* Modals */}
      <AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        initialData={editingMember}
        onSuccess={refresh}
      />

      <AddEventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        member={eventMember}
        onSuccess={refresh}
      />
    </div>
  );
}

/* ---------------- Section ---------------- */

function Section({
  title,
  icon,
  members,
  allowDelete,
  onEdit,
  onDelete,
  onAddEvent,
  empty,
}: any) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <h2 className="text-sm font-bold uppercase">{title}</h2>
      </div>

      {members.length === 0 && empty ? (
        <div className="bg-white border border-dashed rounded-xl p-6 text-center text-slate-500">
          {empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m: any) => (
            <div key={m.id} className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">

              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-bold">{m.first_name}</div>
                  <div className="text-sm text-slate-500">{m.role}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => onEdit(m)}><Edit2 size={16} /></button>
                  {allowDelete(m) && (
                    <button onClick={() => onDelete(m)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="לועזי" value={m.birth_date} />
                <Info label="עברי" value={m.hebrew_birth_date} blue />
              </div>

              {/* Events */}
              <div className="space-y-2">
                {(m.personal_events || []).map((e: any) => (
                  <div key={e.id} className="text-xs bg-slate-50 rounded-lg p-2">
                    <div className="font-bold">{e.description}</div>
                    <div className="text-slate-500">{e.gregorian_date}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onAddEvent(m)}
                className="w-full flex items-center justify-center gap-2 border rounded-xl py-2 text-sm"
              >
                <Calendar size={14} />
                הוסף אירוע
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Info({ label, value, blue }: any) {
  return (
    <div className={`p-3 rounded-lg border text-center ${blue ? "bg-blue-50" : "bg-slate-50"}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}
