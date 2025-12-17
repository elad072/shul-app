"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, MessageSquare, ChevronLeft, Send, Loader2, MoreVertical, Trash2, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type ContactRequest = {
    id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'closed';
    created_at: string;
    last_activity_at: string;
};

type Message = {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
    sender?: { first_name: string; last_name: string; is_gabbai: boolean };
};

export default function ContactTab({ userId }: { userId: string }) {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [view, setView] = useState<"list" | "create" | "chat">("list");
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchRequests();
        fetchSubjects();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("contact_requests")
            .select("*")
            .eq("user_id", userId)
            .order("last_activity_at", { ascending: false });

        if (error) {
            console.error(error);
            toast.error("שגיאה בטעינת פניות");
        } else {
            setRequests(data as any[] || []);
        }
        setLoading(false);
    };

    const fetchSubjects = async () => {
        const { data } = await supabase.from('app_settings').select('*').eq('category', 'contact_subject').eq('is_active', true);
        setSubjects(data || []);
    };

    const handleCreateSuccess = () => {
        fetchRequests();
        setView("list");
        toast.success("הפנייה נפתחה בהצלחה");
    };

    const handleDelete = async (e: any, id: string) => {
        e.stopPropagation();
        if (!confirm("האם למחוק את הפנייה לצמיתות?")) return;

        const { error } = await supabase.from("contact_requests").delete().eq("id", id);
        if (error) toast.error("שגיאה במחיקה");
        else {
            toast.success("הפנייה נמחקה");
            fetchRequests();
        }
    };

    const handleClose = async (e: any, id: string) => {
        e.stopPropagation();
        if (!confirm("האם לסגור את הפנייה?")) return;

        const { error } = await supabase.from("contact_requests").update({ status: 'closed' }).eq("id", id);
        if (error) toast.error("שגיאה בסגירה");
        else {
            toast.success("הפנייה נסגרה");
            fetchRequests();
        }
    };

    if (loading && view === "list") return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] md:h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            {view === "list" && (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-slate-700">הפניות שלי</h3>
                        <button
                            onClick={() => setView("create")}
                            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                        >
                            <Plus size={16} />
                            פנייה חדשה
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center justify-center opacity-60">
                                <MessageSquare size={40} className="text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">אין פניות פתוחות</p>
                                <p className="text-xs text-slate-400 mt-1">כאן תוכל לשלוח בקשות והודעות לגבאים</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => { setSelectedRequestId(req.id); setView("chat"); }}
                                    className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors active:scale-[0.98]"
                                >
                                    <div>
                                        <div className="font-bold text-slate-800">{req.subject}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {new Date(req.last_activity_at).toLocaleDateString("he-IL")}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={req.status} />

                                        {/* Actions Menu */}
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {req.status !== 'closed' && (
                                                <button
                                                    onClick={(e) => handleClose(e, req.id)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition"
                                                    title="סגור פנייה"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, req.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                                title="מחק פנייה"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {view === "create" && (
                <CreateRequestForm
                    userId={userId}
                    subjects={subjects}
                    onCancel={() => setView("list")}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {view === "chat" && selectedRequestId && (
                <ChatView
                    userId={userId}
                    requestId={selectedRequestId}
                    onBack={() => { setView("list"); setSelectedRequestId(null); fetchRequests(); }}
                />
            )}

        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        open: "bg-green-50 text-green-700 border-green-100",
        in_progress: "bg-amber-50 text-amber-700 border-amber-100",
        closed: "bg-slate-50 text-slate-500 border-slate-100",
    };
    const labels: any = {
        open: "פתוח",
        in_progress: "בטיפול",
        closed: "סגור",
    };
    return <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${styles[status] || styles.open}`}>{labels[status] || "סטטוס"}</span>;
}

function CreateRequestForm({ userId, onCancel, onSuccess, subjects }: any) {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async () => {
        if (!subject || !content) return toast.error("יש למלא נושא ותוכן");

        setIsLoading(true);
        try {
            const { data: requestData, error: reqError } = await supabase
                .from("contact_requests")
                .insert({
                    user_id: userId,
                    subject: subject,
                    status: 'open'
                })
                .select()
                .single();

            if (reqError) throw reqError;

            const { error: msgError } = await supabase
                .from("contact_messages")
                .insert({
                    request_id: requestData.id,
                    sender_id: userId,
                    content: content
                });

            if (msgError) throw msgError;

            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("שגיאה ביצירת הפנייה");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2 sticky top-0">
                <button onClick={onCancel} className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 rounded-full"><ChevronLeft /></button>
                <h3 className="font-bold text-lg">פנייה חדשה</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">נושא הפנייה</label>
                    <div className="grid grid-cols-1 gap-2">
                        {subjects.length > 0 ? subjects.map((s: any) => (
                            <button
                                key={s.id}
                                onClick={() => setSubject(s.label)}
                                className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${subject === s.label
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                    }`}
                            >
                                {s.label}
                            </button>
                        )) : (
                            <p className="text-sm text-slate-400">לא הוגדרו נושאים במערכת</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">תוכן ההודעה</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[150px] resize-none shadow-sm"
                        placeholder="פרט כאן את בקשתך..."
                    ></textarea>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    שלח פנייה
                </button>
            </div>
        </div>
    );
}

function ChatView({ userId, requestId, onBack }: any) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel(`request-${requestId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'contact_messages', filter: `request_id=eq.${requestId}` },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(current => [...current, newMsg]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [requestId]);

    const fetchMessages = async () => {
        const { data } = await supabase
            .from("contact_messages")
            .select("*, sender:sender_id(first_name, last_name, is_gabbai)")
            .eq("request_id", requestId)
            .order("created_at", { ascending: true });

        setMessages(data as any[] || []);
        setLoading(false);
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);

        try {
            await supabase.from("contact_messages").insert({
                request_id: requestId,
                sender_id: userId,
                content: newMessage
            });

            await supabase.from("contact_requests").update({
                last_activity_at: new Date().toISOString()
            }).eq("id", requestId);

            setNewMessage("");
        } catch (e) {
            console.error(e);
            toast.error("שגיאה בשליחה");
        }
        setSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2 sticky top-0 shadow-sm z-10">
                <button onClick={onBack} className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 rounded-full"><ChevronLeft /></button>
                <div className="font-bold text-slate-700">התכתבות מול הגבאי</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === userId;
                        const isGabbai = msg.sender?.is_gabbai;

                        return (
                            <div key={msg.id} className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                {/* Sender Name Label */}
                                {!isMe && (
                                    <div className="flex items-center gap-1 mb-1 mr-1 ml-1">
                                        {isGabbai && <div className="bg-blue-100 p-0.5 rounded-full"><CheckCircle size={10} className="text-blue-600" /></div>}
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {isGabbai ? 'הגבאי' : (msg.sender?.first_name || 'משתמש')} {isGabbai ? msg.sender?.first_name : ''}
                                        </span>
                                    </div>
                                )}

                                <div className={`max-w-[85%] p-3 px-4 rounded-2xl text-sm shadow-sm relative group ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                    }`}>
                                    <div className="leading-relaxed">{msg.content}</div>
                                    <div className={`text-[10px] mt-1 text-left ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-white shadow-up">
                <div className="flex gap-2">
                    <input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        type="text"
                        placeholder="כתוב תגובה..."
                        className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 shadow-blue-200 shadow-md"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
