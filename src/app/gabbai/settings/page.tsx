"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function GabbaiSettingsPage() {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newLabel, setNewLabel] = useState("");

    // Only dealing with contact_subject for now as requested
    const CATEGORY = 'contact_subject';

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        const { data } = await supabase
            .from('app_settings')
            .select('*')
            .eq('category', CATEGORY)
            .order('created_at', { ascending: true });

        setOptions(data || []);
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newLabel.trim()) return;

        const { error } = await supabase.from('app_settings').insert({
            category: CATEGORY,
            label: newLabel,
            value: newLabel // simple value mapping
        });

        if (error) {
            console.error(error);
            toast.error("שגיאה בהוספה: " + error.message);
        } else {
            toast.success("נוסף בהצלחה");
            setNewLabel("");
            fetchOptions();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('app_settings').delete().eq('id', id);
        if (error) {
            toast.error("שגיאה במחיקה");
        } else {
            toast.success("נמחק בהצלחה");
            fetchOptions();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">הגדרות אפליקציה</h1>
                <p className="text-slate-500">ניהול רשימות ותוכן דינמי</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-700">נושאי פניות לגבאי</h3>
                <p className="text-sm text-slate-500 mb-6">כאן ניתן להוסיף או להסיר את הנושאים שיופיעו למשתמשים בעת פתיחת פנייה חדשה.</p>

                {loading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <div className="space-y-3">
                        {options.map(opt => (
                            <div key={opt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                                <span className="font-bold text-slate-700">{opt.label}</span>
                                <button onClick={() => handleDelete(opt.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex gap-3 pt-6 border-t border-slate-100">
                    <input
                        type="text"
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        placeholder="הזן נושא חדש..."
                        className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newLabel.trim()}
                        className="px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} />
                        הוסף
                    </button>
                </div>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-700">שיתוף האפליקציה</h3>
                    <p className="text-sm text-slate-500">שלח קישור ישיר להרשמה לחברי הקהילה בוואטסאפ</p>
                </div>
                <button
                    onClick={() => {
                        const text = `שלום! מוזמנים להצטרף לאפליקציית "בית הכנסת מעון קודשך". \nלהרשמה ושימוש כנסו לקישור: ${window.location.origin}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                >
                    <span className="text-xl">📱</span>
                    שתף בוואטסאפ
                </button>
            </div>
        </div>
    );
}
