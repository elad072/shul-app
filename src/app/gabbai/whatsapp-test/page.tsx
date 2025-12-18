"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { sendWhatsAppTestAction, getBotSettings, updateBotSettings } from "./actions";
import { ArrowRight, Send, User, CheckCircle2, AlertCircle, Loader2, Globe, MessageSquare, Sparkles, BrainCircuit, Activity } from "lucide-react";
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
        <div className="max-w-4xl mx-auto px-4 py-12 font-sans overflow-x-hidden">
            <Link href="/gabbai" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors text-right w-full justify-end">
                חזרה לניהול גבאי
                <ArrowRight size={16} className="mr-1 rotate-180" />
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-right" dir="rtl">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <BrainCircuit size={32} className="text-pink-300" />
                            <h1 className="text-3xl font-bold">מעון קודשך - בוט AI</h1>
                        </div>
                        <p className="text-blue-100 opacity-90 text-lg">מופעל באמצעות GPT-4o-mini & WhatsApp Cloud API</p>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[140%] bg-white rounded-full blur-3xl animate-pulse"></div>
                    </div>
                </div>

                <div className="p-8">

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Sidebar info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="flex items-center gap-3 mb-4 text-slate-800">
                                    <Activity size={20} className="text-green-500" />
                                    <h3 className="font-bold">סטטוס מערכת</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">חיבור WhatsApp:</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">פעיל</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">מנוע AI:</span>
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">GPT-4o-mini</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">בסיס נתונים:</span>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">מחובר</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                                <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm">
                                    <Sparkles size={16} />
                                    מה הבוט יודע לעשות?
                                </h3>
                                <ul className="text-xs text-purple-700 space-y-3 leading-relaxed list-none">
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">●</span>
                                        לענות על זמני תפילות (כולל ימי חול ושבתות)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">●</span>
                                        לדווח על הודעות אחרונות מהגבאי
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">●</span>
                                        לפרט על אירועי קהילה קרובים
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">●</span>
                                        לזהות משתמשים רשומים ולברך אותם אישית
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* Bot Context Config (Optional, using it as 'Instructions' now) */}
                            <section>
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-indigo-600" />
                                    הגדרות הנחייה (System Prompt Context)
                                </h2>
                                <p className="text-sm text-slate-500 mb-4">
                                    הודעה זו משמשת כבסיס ההנחיה ל-AI (בנוסף לנתונים שנוספים אוטומטית מהמערכת).
                                </p>
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    className="w-full h-40 border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm leading-relaxed font-sans"
                                    placeholder="הכנס את הודעת הברוך הבא או הנחיות נוספות..."
                                />
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={savingSettings}
                                    className="mt-3 flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-md"
                                >
                                    {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    עדכן הגדרות בוט
                                </button>
                            </section>

                            {/* API Connection Test */}
                            <section className="pt-8 border-t border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Send size={20} className="text-blue-600" />
                                    בדיקת שליחה (Cloud API)
                                </h2>
                                <p className="text-sm text-slate-500 mb-4">
                                    בדוק את החיבור למערכת ה-Cloud של WhatsApp על ידי שליחת הודעת תבנית למספר שמוגדר.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSendTest}
                                        disabled={sending}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all
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
                                                בדיקת שליחת תבנית
                                            </>
                                        )}
                                    </button>
                                </div>

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
                                                    {result.success ? 'הודעת Hello World נשלחה בהצלחה!' : 'שגיאה בשליחה'}
                                                </div>
                                                {!result.success && <div className="mt-1 text-xs opacity-70">{JSON.stringify(result.error)}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Webhook Configuration */}
                            <section className="pt-8 border-t border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">הגדרות Webhook</h2>
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
        </div>
    );
}
