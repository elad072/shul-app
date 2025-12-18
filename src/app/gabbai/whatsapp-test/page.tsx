"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { sendWhatsAppTestAction } from "./actions";
import { ArrowRight, Send, User, CheckCircle2, AlertCircle, Loader2, Globe } from "lucide-react";
import Link from "next/link";

export default function WhatsAppTestPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [baseUrl, setBaseUrl] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setBaseUrl(window.location.origin);
        async function getUser() {
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
            setLoading(false);
        }
        getUser();
    }, []);

    const handleSendTest = async () => {
        setSending(true);
        setResult(null);
        const userName = profile?.first_name || user?.email || "משתמש לא ידוע";
        const res = await sendWhatsAppTestAction(userName);
        setResult(res);
        setSending(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 font-sans">
            <Link href="/gabbai" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                <ArrowRight size={16} className="ml-1" />
                חזרה לניהול גבאי
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">מערכת WhatsApp Cloud</h1>
                    <p className="text-blue-100 opacity-90">בדיקת שליחה והגדרת תגובה אוטומטית (Webhook)</p>
                </div>

                <div className="p-8">
                    {/* User Info Card */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium">משתמש מחובר במערכת</div>
                            <div className="text-lg font-bold text-slate-800">
                                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : user?.email}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">1. בדיקת שליחה</h2>
                        <div className="text-slate-600 leading-relaxed text-sm">
                            לחיצה על הכפתור תשלח הודעה למספר <span className="font-bold">972542889950</span> כדי לוודא שפרטי ה-API ב-env תקינים.
                        </div>

                        <button
                            onClick={handleSendTest}
                            disabled={sending}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all
                ${sending
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200 active:scale-[0.98]"
                                }`}
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    שולח...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    שלח הודעת בדיקה
                                </>
                            )}
                        </button>

                        {/* Result Feedback */}
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
                                            {result.success ? 'ההודעה נשלחה!' : 'שגיאה בשליחה'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Webhook Configuration */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Globe size={20} className="text-blue-500" />
                                2. הגדרת Webhook לתגובה אוטומטית
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                כדי שהמערכת תוכל לענות למי ששולח לה הודעה ("מי המשתמש"), עליך להגדיר את הכתובות הבאות ב-Meta Developer Portal:
                            </p>

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

                            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 italic text-xs text-blue-700">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <div>
                                    הערה: ה-API מזהה את המשתמש לפי עמודת ה-phone בטבלת הפרופילים. ודא שהמספרים ב-DB כוללים קידומת בינלאומית (למשל 972...).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
