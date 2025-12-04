"use client";

import { useState } from "react";
import { Search, Plus, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addFamily, addMember } from "./actions";
import { MemberWithFamily } from "@/types/custom";

/* ---------- TYPES ---------- */
interface SimpleFamily {
  id: string;
  family_name: string;
}

interface MembersTableProps {
  initialMembers: MemberWithFamily[];
  allFamilies: SimpleFamily[];
}

export default function MembersTable({
  initialMembers,
  allFamilies,
}: MembersTableProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ============================================================= */
  /* ====================== FILTER MEMBERS ======================= */
  /* ============================================================= */

  const filteredMembers = initialMembers.filter((member) => {
    const familyName = member.families?.family_name || "";
    const actualLastName = member.last_name || familyName;
    const fullName = `${member.first_name} ${actualLastName}`;
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchLower) ||
      (member.phone && member.phone.includes(searchLower)) ||
      familyName.toLowerCase().includes(searchLower)
    );
  });

  /* ============================================================= */
  /* ===================== SAVE NEW FAMILY ======================== */
  /* ============================================================= */

  const handleSaveFamily = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await addFamily(formData);

      if (result.success) {
        setIsFamilyModalOpen(false);
        router.refresh();
      } else {
        alert(`שגיאה: ${result.message}`);
      }
    } catch (_) {
      alert("אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================= */
  /* ===================== SAVE NEW MEMBER ======================== */
  /* ============================================================= */

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await addMember(formData);

      if (result.success) {
        router.refresh();
        setTimeout(() => setIsMemberModalOpen(false), 50);
      } else {
        alert(`שגיאה: ${result.message}`);
      }
    } catch (_) {
      alert("אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================= */
  /* ========================== RETURN ============================ */
  /* ============================================================= */

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="חפש לפי שם או טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-2">
          {/* כפתור אפור כהה */}
          <button
            onClick={() => setIsFamilyModalOpen(true)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm shadow"
          >
            <Plus className="h-4 w-4" /> משפחה חדשה
          </button>

          {/* כפתור כחול כהה */}
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            <Plus className="h-4 w-4" /> חבר חדש
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm border-collapse">
          <thead className="bg-[#E5EAF2] text-[#1A1F36] font-semibold border-b border-gray-300">
            <tr>
              <th className="px-6 py-3">שם מלא</th>
              <th className="px-6 py-3">משפחה</th>
              <th className="px-6 py-3">טלפון</th>
              <th className="px-6 py-3">כתובת</th>
              <th className="px-6 py-3 text-center">פעולות</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3 text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border">
                      <User className="h-4 w-4" />
                    </div>
                    {member.first_name} {member.last_name}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {member.families?.family_name || "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700 dir-ltr font-mono">
                    {member.phone || "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {member.families?.address || "-"}
                  </td>

                  <td className="px-6 py-4 text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                    עריכה
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-10 text-center text-gray-500"
                  colSpan={5}
                >
                  לא נמצאו חברים התואמים את החיפוש.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <div className="p-4 border-t text-xs text-gray-400 text-center bg-gray-50">
        סה״כ מוצגים: {filteredMembers.length} חברים
      </div>

      {/* FAMILY MODAL */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl border border-gray-200">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                הוספת משפחה חדשה
              </h2>
              <button onClick={() => setIsFamilyModalOpen(false)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  שם משפחה *
                </label>
                <input
                  name="family_name"
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  כתובת
                </label>
                <input
                  name="address"
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  טלפון
                </label>
                <input
                  name="phone"
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md mt-3"
              >
                {loading ? "שומר..." : "שמור"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl border border-gray-200">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                הוספת חבר חדש
              </h2>
              <button onClick={() => setIsMemberModalOpen(false)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  שיוך למשפחה *
                </label>
                <select
                  name="family_id"
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                >
                  <option value="">בחר...</option>
                  {allFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.family_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    שם פרטי *
                  </label>
                  <input
                    name="first_name"
                    required
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    שם משפחה
                  </label>
                  <input
                    name="last_name"
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  טלפון
                </label>
                <input
                  name="phone"
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  אימייל
                </label>
                <input
                  type="email"
                  name="email"
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-900 shadow-sm"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md mt-3"
              >
                {loading ? "שומר..." : "שמור"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
