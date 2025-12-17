"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Loader2, User, Send, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type RequestStub = {
    id: string;
    subject: string;
    status: string;
    last_activity_at: string;
    user: {
        first_name: string;
        last_name: string;
        phone: string;
    }
};

type Message = {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
};

export default function InboxClient({ currentUserId }: { currentUserId: string }) {
    const [requests, setRequests] = useState<RequestStub[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<RequestStub | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingList, setLoadingList] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (selectedRequest) fetchMessages(selectedRequest.id);
    }, [selectedRequest]);

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from("contact_requests")
            .select("*, user:user_id(first_name, last_name, phone)")
            .order("last_activity_at", { ascending: false });

        if (!error) setRequests(data as any[] || []);
        setLoadingList(false);
    };

    const fetchMessages = async (requestId: string) => {
        setLoadingChat(true);
        const { data } = await supabase
            .from("contact_messages")
            .select("*")
            .eq("request_id", requestId)
            .order("created_at", { ascending: true });

        setMessages(data as any[] || []);
        setLoadingChat(false);
    };

    const handleSend = async () => {
        if (!selectedRequest || !newMessage.trim()) return;

        try {
            await supabase.from("contact_messages").insert({
                request_id: selectedRequest.id,
                sender_id: currentUserId,
                content: newMessage
            });

            // Update last activity
            await supabase.from("contact_requests").update({
                last_activity_at: new Date().toISOString(),
                status: 'in_progress' // Auto mark as in progress
            }).eq("id", selectedRequest.id);

            setNewMessage("");
            fetchMessages(selectedRequest.id); // Refresh chat
            toast.success("תגובה נשלחה");
        } catch (e) {
            toast.error("שגיאה בשליחה");
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedRequest) return;
        await supabase.from("contact_requests").update({ status }).eq("id", selectedRequest.id);

        // Update local state
        setRequests(reqs => reqs.map(r => r.id === selectedRequest.id ? { ...r, status } : r));
        toast.success("סטטוס עודכן");
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

            {/* List Sidebar - Hidden on mobile if chat is open */}
            <div className={`w-full md:w-1/3 border-l border-slate-200 bg-slate-50 flex flex-col absolute md:relative z-10 h-full transition-transform duration-300 ${selectedRequest ? 'translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b border-slate-200 bg-white sticky top-0">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="חיפוש פניות..." className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loadingList ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : (
                        requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition ${selectedRequest?.id === req.id ? 'bg-white border-r-4 border-r-blue-600 shadow-sm' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{req.user?.first_name} {req.user?.last_name}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(req.last_activity_at).toLocaleDateString("he-IL")}</span>
                                </div>
                                <div className="text-sm text-slate-600 truncate font-medium">{req.subject}</div>
                                <div className="mt-2 flex">
                                    <StatusBadge status={req.status} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area - Full screen on mobile */}
            <div className={`w-full md:flex-1 flex flex-col bg-white absolute md:relative h-full transition-transform duration-300 ${selectedRequest ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {selectedRequest ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedRequest(null)} className="md:hidden p-2 -mr-2 text-slate-500 rounded-full hover:bg-slate-100"><ChevronLeft /></button>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-800 leading-tight">{selectedRequest.subject}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <User size={12} />
                                        {selectedRequest.user?.first_name} {selectedRequest.user?.last_name}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => updateStatus('in_progress')} title="סמן בטיפול" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Loader2 size={18} /></button>
                                <button onClick={() => updateStatus('closed')} title="סגור פנייה" className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle size={18} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
                            {loadingChat ? (
                                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300" /></div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === currentUserId;
                                    const senderName = isMe ? 'אני' : (selectedRequest?.user?.first_name || 'משתמש');

                                    return (
                                        <div key={msg.id} className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                            {/* Name Label */}
                                            <div className="text-[10px] text-slate-400 px-1 mb-1">
                                                {senderName}
                                            </div>

                                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100'
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                                <div className={`text-[10px] mt-1 text-left opacity-70`}>
                                                    {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="כתוב תגובה..."
                                    className="flex-1 bg-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <User size={32} />
                        </div>
                        <p className="font-medium">בחר פנייה מהרשימה</p>
                    </div>
                )}
            </div>

        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        open: "bg-green-100 text-green-700",
        in_progress: "bg-amber-100 text-amber-700",
        closed: "bg-slate-100 text-slate-500",
    };
    const labels: any = {
        open: "חדש",
        in_progress: "בטיפול",
        closed: "סגור",
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[status] || styles.open}`}>{labels[status]}</span>;
}
