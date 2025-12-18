"use client";

import { useState, useEffect } from "react";
import { Book, Calendar, User, Search, Filter, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    getTorahReadings,
    selfAssignTorahReading,
    removeSelfAssignment,
    type TorahReadingAssignment,
} from "@/app/actions/torahReadingActions";
import { getTorahReadingsForYear, getCurrentHebrewYear } from "@/lib/torahReadingUtils";

export default function TorahReadingsPage() {
    const [readings, setReadings] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<TorahReadingAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "available" | "assigned">("all");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);

        // Get current Hebrew year
        const hebrewYear = getCurrentHebrewYear();

        // Get all Torah readings for the year from hebcal
        const allReadings = getTorahReadingsForYear(hebrewYear);

        // Get assignments from database
        const assignmentsData = await getTorahReadings(hebrewYear);

        // Merge data
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
        setAssignments(assignmentsData);
        setLoading(false);
    }

    async function handleSelfAssign(reading: any) {
        const dateStr = reading.gregorianDate.toISOString().split('T')[0];

        const result = await selfAssignTorahReading(
            dateStr,
            reading.hebrewDate,
            reading.parashaNameHebrew,
            reading.year
        );

        if (result.success) {
            toast.success("שובצת בהצלחה לקריאת התורה!");
            await loadData();
        } else {
            toast.error(result.error || "שגיאה בשיבוץ");
        }
    }

    async function handleRemoveAssignment(assignmentId: string) {
        if (!confirm("האם אתה בטוח שברצונך לבטל את השיבוץ?")) return;

        const result = await removeSelfAssignment(assignmentId);

        if (result.success) {
            toast.success("השיבוץ בוטל בהצלחה");
            await loadData();
        } else {
            toast.error(result.error || "שגיאה בביטול השיבוץ");
        }
    }

    const normalize = (str: string) => {
        if (!str) return "";
        return str.replace(/[\u0591-\u05C7]/g, "") // Remove Nikud
            .replace(/פרשת\s+/g, "") // Remove "Parashat"
            .trim();
    };

    const filteredReadings = readings.filter(reading => {
        const search = searchTerm.trim();
        if (!search) return filterStatus === "all" || (filterStatus === "available" && !reading.assignment) || (filterStatus === "assigned" && reading.assignment);

        const normalizedSearch = normalize(search);
        const normalizedParasha = normalize(reading.parashaNameHebrew);

        // Search filter - improved for Hebrew
        const matchesSearch =
            normalizedParasha.includes(normalizedSearch) ||
            reading.parashaNameHebrew.includes(search) ||
            reading.hebrewDate.includes(search) ||
            (reading.assignment?.assigned_name || "").includes(search);

        // Status filter
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "available" && !reading.assignment) ||
            (filterStatus === "assigned" && reading.assignment);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-blue-700 border border-blue-800 p-6 md:p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-200 border border-white/10">
                            <Book size={14} />
                            קריאת התורה
                        </div>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1 text-sm font-bold text-white/80 hover:text-white transition-colors"
                        >
                            חזרה לדף הבית
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                        שיבוץ בעלי קריאה בתורה
                    </h1>
                    <p className="text-blue-100/70 text-base md:text-lg max-w-2xl leading-relaxed">
                        כאן ניתן לראות את כל הפרשות של השנה ולשבץ את עצמך לקריאת התורה
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="חיפוש לפי שם פרשה או תאריך עברי..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                        >
                            <option value="all">הכל</option>
                            <option value="available">פנוי</option>
                            <option value="assigned">משובץ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Readings List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReadings.map((reading, index) => (
                        <ReadingCard
                            key={index}
                            reading={reading}
                            onAssign={() => handleSelfAssign(reading)}
                            onRemove={() => reading.assignment && handleRemoveAssignment(reading.assignment.id)}
                        />
                    ))}
                </div>
            )}

            {filteredReadings.length === 0 && !loading && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">לא נמצאו פרשות התואמות את החיפוש</p>
                </div>
            )}
        </div>
    );
}

function ReadingCard({ reading, onAssign, onRemove }: any) {
    const isAssigned = !!reading.assignment;
    const isSelfAssigned = reading.assignment?.is_self_assigned;
    const isPast = new Date(reading.gregorianDate) < new Date();

    return (
        <div className={`relative group overflow-hidden bg-white border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${isAssigned ? 'border-green-100' : 'border-slate-200'
            }`}>
            {/* Status Indicator */}
            {isAssigned && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600"></div>
            )}

            <div className="p-5 space-y-4">
                {/* Date Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Calendar size={16} />
                            <span className="text-sm font-bold">
                                {new Date(reading.gregorianDate).toLocaleDateString('he-IL')}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500">{reading.hebrewDate}</div>
                    </div>

                    {isPast && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                            עבר
                        </span>
                    )}
                </div>

                {/* Parasha Name */}
                <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">
                        {reading.parashaNameHebrew}
                    </h3>
                </div>

                {/* Assignment Status */}
                <div className="pt-3 border-t border-slate-100">
                    {isAssigned ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-700">
                                <User size={16} />
                                <span className="font-bold text-sm">{reading.assignment.assigned_name}</span>
                            </div>
                            {isSelfAssigned && (
                                <button
                                    onClick={onRemove}
                                    className="w-full py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    ביטול שיבוץ
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onAssign}
                            disabled={isPast}
                            className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all ${isPast
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                }`}
                        >
                            {isPast ? 'עבר' : 'שבץ אותי'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
