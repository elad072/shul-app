"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { sendWhatsAppTestAction, getBotSettings, updateBotSettings } from "./actions";
import { ArrowRight, Send, User, CheckCircle2, AlertCircle, Loader2, Globe, MessageSquare, Save } from "lucide-react";
import Link from "next/link";

export default function WhatsAppTestPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [baseUrl, setBaseUrl] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setBaseUrl(window.location.origin);
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(profile);
            }

            // Fetch Bot Settings
            const { data: settings } = await getBotSettings();
            if (settings?.value) {
                setWelcomeMessage(settings.value);
            }

            setLoading(false);
        }
        init();
    }, []);

    const handleSendTest = async () => {
        setSending(true);
        setResult(null);
        const userName = profile?.first_name || user?.email || "משתמש לא ידוע";
        const res = await sendWhatsAppTestAction(userName);
        setResult(res);
        setSending(false);
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        const res = await updateBotSettings(welcomeMessage);
        if (res.success) {
            alert("הגדרות נשמרו בהצלחה!");
        } else {
            alert("שגיאה בשמירה: " + res.error);
        }
        setSavingSettings(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 font-sans">
            <Link href="/gabbai" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors text-right w-full justify-end">
                חזרה לניהול גבאי
                <ArrowRight size={16} className="mr-1 rotate-180" />
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-right" dir="rtl">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-green-600 to-teal-700 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">מערכת הבוט של מעון קודשך</h1>
                    <p className="text-green-100 opacity-90">ניהול תגובות אוטומטיות וניתוב הודעות WhatsApp</p>
                </div>

                <div className="p-8">

                    {/* User Info Card */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium">מנהל מחובר</div>
                            <div className="text-lg font-bold text-slate-800">
                                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : user?.email}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">

                        {/* Bot Welcome Message Settings */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MessageSquare size={20} className="text-green-600" />
                                1. הודעת פתיחה של הבוט
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                הודעה זו תישלח כאשר משתמש כותב "שלום" או כשהוא לא מזוהה במערכת.
                            </p>
                            <textarea
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className="w-full h-40 border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all text-sm leading-relaxed font-sans"
                                placeholder="הכנס את הודעת הברוך הבא של הבוט..."
                            />
                            <button
                                onClick={handleSaveSettings}
                                disabled={savingSettings}
                                className="mt-3 flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                שמור הודעת פתיחה
                            </button>
                        </section>

                        {/* Router Capabilities Info */}
                        <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                                <Globe size={16} />
                                יכולות ניתוב אוטומטי (Router)
                            </h3>
                            <div className="text-xs text-blue-700 space-y-2 leading-relaxed">
                                <p>הראוטר מזהה כרגע את מילות המפתח הבאות ושולף זמנים ישירות מבסיס הנתונים:</p>
                                <ul className="list-disc list-inside space-y-1 pr-2">
                                    <li><strong>זמנים של שישי</strong> - שולף את תפילות יום ו'.</li>
                                    <li><strong>זמנים של שבת</strong> - שולף את תפילות יום שבת.</li>
                                    <li><strong>זמנים של יום חול</strong> - שולף תפילות קבועות (ללא יום מוגדר).</li>
                                </ul>
                            </div>
                        </section>

                        {/* Test Sending */}
                        <section className="pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Send size={20} className="text-blue-600" />
                                2. בדיקת חיבור חיצוני (API)
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                שלח הודעת תבנית (Template) למספר <strong>972542889950</strong> כדי לוודא שפרטי ה-API תקינים.
                            </p>

                            <button
                                onClick={handleSendTest}
                                disabled={sending}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all
                  ${sending
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
                                    }`}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        שולח...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} className="ml-1" />
                                        בדיקת שליחה (API Check)
                                    </>
                                )}
                            </button>

                            {result && (
                                <div className={`mt-4 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex items-start gap-3">
                                        {result.success ? (
                                            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                                        ) : (
                                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                                        )}
                                        <div className="text-sm">
                                            <div className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                                {result.success ? 'החיבור תקין וההודעה נשלחה!' : 'שגיאה בחיבור'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Webhook Configuration */}
                        <section className="pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">3. הגדרות Webhook</h2>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Callback URL</div>
                                    <div className="bg-white border rounded-xl p-3 font-mono text-xs break-all text-blue-600 select-all">
                                        {baseUrl}/api/whatsapp/webhook
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Verify Token</div>
                                    <div className="bg-white border rounded-xl p-3 font-mono text-xs text-indigo-600 select-all">
                                        shul_app_webhook_verify_token
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
