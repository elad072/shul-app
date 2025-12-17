"use client";

import { useState, useEffect, useRef } from "react";
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

export default function ContactTab({ userId, onRead }: { userId: string, onRead?: () => void }) {
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
        <div className="flex flex-col h-[calc(100dvh-160px)] md:h-[600px] bg-slate-50 md:bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-sm overflow-hidden relative">

            {view === "list" && (
                <div className="flex flex-col h-full relative">
                    {/* Desktop Header */}
                    <div className="hidden md:flex p-4 border-b border-slate-100 justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-slate-700">הפניות שלי</h3>
                        <button
                            onClick={() => setView("create")}
                            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                        >
                            <Plus size={16} />
                            פנייה חדשה
                        </button>
                    </div>

                    {/* Mobile Header (Simple Title) */}
                    <div className="md:hidden p-4 pb-2">
                        <h3 className="text-2xl font-bold text-slate-800">הפניות שלי</h3>
                        <p className="text-sm text-slate-500">לרשותך בכל עניין ושאלה</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center justify-center opacity-60">
                                <MessageSquare size={48} className="text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold text-lg">עדיין לא שלחת פניות</p>
                                <p className="text-sm text-slate-400 mt-1 max-w-[200px]">לחץ על כפתור הפלוס למטה כדי להתחיל שיחה חדשה עם הגבאי</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => { setSelectedRequestId(req.id); setView("chat"); }}
                                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
                                >
                                    <div>
                                        <div className="font-bold text-slate-800 text-base mb-1">{req.subject}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <span>עודכן:</span>
                                            {new Date(req.last_activity_at).toLocaleDateString("he-IL")}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={req.status} />

                                        {/* Mobile Actions (Swipe or just visible) - Keeping simple visible for now but larger targets */}
                                        <div className="flex items-center gap-1">
                                            {req.status !== 'closed' && (
                                                <button
                                                    onClick={(e) => handleClose(e, req.id)}
                                                    className="p-2 text-slate-300 hover:text-amber-500 transition"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Mobile FAB (Floating Action Button) */}
                    <button
                        onClick={() => setView("create")}
                        className="md:hidden absolute bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform z-20"
                    >
                        <Plus size={28} strokeWidth={2.5} />
                    </button>
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
                    onRead={onRead}
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
        <div className="fixed inset-0 z-[100] bg-slate-50 md:static md:bg-white md:h-full flex flex-col h-[100dvh] md:h-auto">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 shadow-sm z-10 safe-top">
                <button onClick={onCancel} className="p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-full active:bg-slate-100"><ChevronLeft size={24} /></button>
                <h3 className="font-bold text-xl text-slate-800">פנייה חדשה</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32 overscroll-contain">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">בחר נושא</label>
                    <div className="grid grid-cols-1 gap-3">
                        {subjects.length > 0 ? subjects.map((s: any) => (
                            <button
                                key={s.id}
                                onClick={() => setSubject(s.label)}
                                className={`p-4 rounded-2xl border text-center font-bold transition-all relative overflow-hidden ${subject === s.label
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-[1.02]'
                                    : 'bg-white text-slate-600 border-slate-200 shadow-sm active:scale-[0.98]'
                                    }`}
                            >
                                {s.label}
                                {subject === s.label && <div className="absolute top-0 right-0 w-full h-full bg-white/10" />}
                            </button>
                        )) : (
                            <p className="text-sm text-slate-400">לא הוגדרו נושאים במערכת</p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">פירוט הבקשה</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full p-5 rounded-2xl border-0 shadow-sm focus:ring-2 focus:ring-blue-500 bg-white min-h-[200px] resize-none text-base placeholder:text-slate-300"
                        placeholder="כתוב כאן את תוכן הפנייה..."
                    ></textarea>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={22} />}
                    שלח פנייה
                </button>
            </div>
        </div>
    );
}

function ChatView({ userId, requestId, onBack, onRead }: any) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        fetchMessages();
        markAsRead();

        const channel = supabase
            .channel(`request-${requestId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'contact_messages', filter: `request_id=eq.${requestId}` },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(current => [...current, newMsg]);
                    if (newMsg.sender_id !== userId) markAsRead();
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [requestId]);

    const markAsRead = async () => {
        // Mark strictly other's messages as read
        await supabase.from("contact_messages")
            .update({ is_read: true })
            .eq("request_id", requestId)
            .neq("sender_id", userId)
            .eq("is_read", false); // Only unread ones

        // Notify parent to refresh badge
        if (onRead) onRead();
    };

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
        <div className="fixed inset-0 z-[200] bg-slate-50 md:static md:bg-white md:h-full flex flex-col h-[100dvh] md:h-auto">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2 shadow-sm z-10 safe-top">
                <button onClick={onBack} className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 rounded-full"><ChevronLeft /></button>
                <div className="font-bold text-slate-800 text-lg">צ'אט עם הגבאי</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 pb-32 overscroll-contain">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === userId;
                        const isGabbai = msg.sender?.is_gabbai;

                        return (
                            <div key={msg.id} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
                                {/* Sender Name Label */}
                                {!isMe && (
                                    <div className="flex items-center gap-1 mb-1 mr-1 ml-1 opacity-80">
                                        {isGabbai && <div className="bg-blue-100 p-0.5 rounded-full"><CheckCircle size={10} className="text-blue-600" /></div>}
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {isGabbai ? 'הגבאי' : (msg.sender?.first_name || 'משתמש')} {isGabbai ? msg.sender?.first_name : ''}
                                        </span>
                                    </div>
                                )}

                                <div className={`max-w-[85%] p-4 px-5 rounded-3xl text-sm shadow-sm relative group ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                    }`}>
                                    <div className="leading-relaxed text-base">{msg.content}</div>
                                    <div className={`text-[10px] mt-2 text-left opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 safe-bottom">
                <div className="flex gap-2 items-end bg-slate-100 p-2 rounded-3xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-white focus-within:bg-white transition-all shadow-sm">
                    <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="כתוב תגובה..."
                        rows={1}
                        className="flex-1 bg-transparent px-3 py-3 text-base focus:outline-none min-w-0 placeholder:text-slate-400 resize-none max-h-[120px]"
                        style={{ minHeight: '44px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="w-11 h-11 mb-0.5 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-blue-200 transition-transform active:scale-95"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
