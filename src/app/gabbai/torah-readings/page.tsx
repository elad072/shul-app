"use client";

import { useState, useEffect } from "react";
import { Book, Calendar, User, Search, Plus, Edit2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
    getTorahReadings,
    gabbaiAssignUser,
    gabbaiAssignNewMember,
    gabbaiRemoveAssignment,
    getAllUsers,
    type TorahReadingAssignment,
} from "@/app/actions/torahReadingActions";
import { getTorahReadingsForYear, getCurrentHebrewYear } from "@/lib/torahReadingUtils";

export default function GabbaiTorahReadingsPage() {
    const [readings, setReadings] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReading, setSelectedReading] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);

        const hebrewYear = getCurrentHebrewYear();
        const allReadings = getTorahReadingsForYear(hebrewYear);
        const assignmentsData = await getTorahReadings(hebrewYear);
        const usersData = await getAllUsers();

        const merged = allReadings.map(reading => {
            const assignment = assignmentsData.find(
                a => a.gregorian_date === reading.gregorianDate.toISOString().split('T')[0]
            );

            return {
                ...reading,
                assignment: assignment || null,
            };
        });

        setReadings(merged);
        setUsers(usersData);
        setLoading(false);
    }

    async function handleRemove(assignmentId: string) {
        if (!confirm("האם אתה בטוח שברצונך למחוק את השיבוץ?")) return;

        const result = await gabbaiRemoveAssignment(assignmentId);

        if (result.success) {
            toast.success("השיבוץ נמחק בהצלחה");
            await loadData();
        } else {
            toast.error(result.error || "שגיאה במחיקה");
        }
    }

    function openAssignModal(reading: any) {
        setSelectedReading(reading);
        setIsModalOpen(true);
    }

    const normalize = (str: string) => {
        if (!str) return "";
        return str.replace(/[\u0591-\u05C7]/g, "") // Remove Nikud
            .replace(/פרשת\s+/g, "") // Remove "Parashat"
            .trim();
    };

    const filteredReadings = readings.filter(reading => {
        const search = searchTerm.trim();
        if (!search) return true;

        const normalizedSearch = normalize(search);
        const normalizedParasha = normalize(reading.parashaNameHebrew);

        return (
            normalizedParasha.includes(normalizedSearch) ||
            reading.parashaNameHebrew.includes(search) ||
            reading.hebrewDate.includes(search) ||
            (reading.assignment?.assigned_name || "").includes(search)
        );
    });

    return (
        <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 to-amber-700 border border-amber-800 p-6 md:p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-white/10">
                        <Book size={14} />
                        ניהול גבאי
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                        ניהול קריאת התורה
                    </h1>
                    <p className="text-amber-100/70 text-base md:text-lg max-w-2xl leading-relaxed">
                        שיבוץ בעלי קריאה בתורה לכל השנה
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="חיפוש לפי פרשה, תאריך או שם..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop Table - Hidden on Mobile */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">תאריך</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">פרשה</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">בעל קריאה</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">סטטוס</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredReadings.map((reading, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {new Date(reading.gregorianDate).toLocaleDateString('he-IL')}
                                                </div>
                                                <div className="text-xs text-slate-500">{reading.hebrewDate}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{reading.parashaNameHebrew}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {reading.assignment ? (
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-green-600" />
                                                        <span className="font-medium text-slate-900">
                                                            {reading.assignment.assigned_name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">לא משובץ</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reading.assignment ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reading.assignment.is_self_assigned
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {reading.assignment.is_self_assigned ? 'שיבוץ עצמי' : 'שובץ ע"י גבאי'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        פנוי
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openAssignModal(reading)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title={reading.assignment ? "עריכת שיבוץ" : "שיבוץ"}
                                                    >
                                                        {reading.assignment ? <Edit2 size={18} /> : <Plus size={18} />}
                                                    </button>
                                                    {reading.assignment && (
                                                        <button
                                                            onClick={() => handleRemove(reading.assignment.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="מחיקת שיבוץ"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="md:hidden space-y-4">
                        {filteredReadings.map((reading, index) => (
                            <div key={index} className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${reading.assignment ? 'border-green-100' : 'border-slate-100'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xs text-slate-500">{reading.hebrewDate}</div>
                                        <div className="font-bold text-slate-900">{reading.parashaNameHebrew}</div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-blue-600">
                                            {new Date(reading.gregorianDate).toLocaleDateString('he-IL')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex-1">
                                        {reading.assignment ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                                    <User size={14} className="text-green-600" />
                                                    {reading.assignment.assigned_name}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {reading.assignment.is_self_assigned ? 'שיבוץ עצמי' : 'שובץ ע"י גבאי'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-400">פנוי לשיבוץ</div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openAssignModal(reading)}
                                            className="p-2.5 bg-amber-50 text-amber-600 rounded-xl active:scale-95 transition-all shadow-sm"
                                        >
                                            {reading.assignment ? <Edit2 size={18} /> : <Plus size={18} />}
                                        </button>
                                        {reading.assignment && (
                                            <button
                                                onClick={() => handleRemove(reading.assignment.id)}
                                                className="p-2.5 bg-red-50 text-red-600 rounded-xl active:scale-95 transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Assignment Modal */}
            {isModalOpen && (
                <AssignmentModal
                    reading={selectedReading}
                    users={users}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedReading(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedReading(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

function AssignmentModal({ reading, users, onClose, onSuccess }: any) {
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredUsers = users.filter((u: any) =>
        `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || "").includes(userSearch)
    );

    async function handleSubmit() {
        setLoading(true);

        const dateStr = reading.gregorianDate.toISOString().split('T')[0];

        if (mode === "existing") {
            if (!selectedUserId) {
                toast.error("יש לבחור משתמש");
                setLoading(false);
                return;
            }

            const result = await gabbaiAssignUser(
                dateStr,
                reading.hebrewDate,
                reading.parashaNameHebrew,
                reading.year,
                selectedUserId,
                notes
            );

            if (result.success) {
                toast.success("השיבוץ בוצע בהצלחה");
                onSuccess();
            } else {
                toast.error(result.error || "שגיאה בשיבוץ");
            }
        } else {
            if (!firstName || !lastName) {
                toast.error("יש למלא שם פרטי ושם משפחה");
                setLoading(false);
                return;
            }

            const result = await gabbaiAssignNewMember(
                dateStr,
                reading.hebrewDate,
                reading.parashaNameHebrew,
                reading.year,
                firstName,
                lastName,
                phone,
                notes
            );

            if (result.success) {
                toast.success(result.message || "חבר חדש נוסף ושובץ בהצלחה");
                onSuccess();
            } else {
                toast.error(result.error || "שגיאה בהוספה");
            }
        }

        setLoading(false);
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">שיבוץ לקריאת התורה</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {reading.parashaNameHebrew} • {new Date(reading.gregorianDate).toLocaleDateString('he-IL')}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode("existing")}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === "existing"
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <User size={16} className="inline mr-2" />
                            חבר קיים
                        </button>
                        <button
                            onClick={() => setMode("new")}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === "new"
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <UserPlus size={16} className="inline mr-2" />
                            חבר חדש
                        </button>
                    </div>

                    {mode === "existing" ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    חפש ובחר חבר
                                </label>
                                <div className="relative mb-2">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="חיפוש לפי שם..."
                                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white font-medium"
                                >
                                    <option value="">-- בחר מרשימה ({filteredUsers.length} תוצאות) --</option>
                                    {filteredUsers.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} {user.phone ? `(${user.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    שם פרטי *
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    placeholder="הזן שם פרטי"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    שם משפחה *
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    placeholder="הזן שם משפחה"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    טלפון (אופציונלי)
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    placeholder="הזן מספר טלפון"
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            הערות (אופציונלי)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                            placeholder="הערות נוספות..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 transition-colors"
                    >
                        {loading ? "שומר..." : "שמירה"}
                    </button>
                </div>
            </div>
        </div>
    );
}
