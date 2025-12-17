"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Mail, Phone, Edit2, Trash2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import UserEditDialog from "@/app/components/users/UserEditDialog";
import { deleteUser } from "./actions";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    is_gabbai: boolean | null;
    created_at: string;
};

export default function UsersTable({ initialUsers }: { initialUsers: Profile[] }) {
    const [users, setUsers] = useState<Profile[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Initialize Supabase client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = (user.phone || "");
        const term = searchTerm.toLowerCase();

        return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });

    const handleDelete = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק משתמש זה? פעולה זו אינה הפיכה.")) return;

        try {
            // קריאה ל-Server Action למחיקה מלאה (כולל Auth)
            const result = await deleteUser(id);

            if (!result.success) {
                throw new Error(result.error);
            }

            setUsers(users.filter(u => u.id !== id));
            toast.success("המשתמש נמחק בהצלחה");
        } catch (error: any) {
            console.error(error);
            toast.error("שגיאה במחיקת המשתמש: " + error.message);
        }
    };

    const handleSaveUser = async (updatedUser: Profile) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    is_gabbai: updatedUser.is_gabbai
                })
                .eq("id", updatedUser.id);

            if (error) throw error;

            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            toast.success("פרטי המשתמש עודכנו בהצלחה");
            setIsEditDialogOpen(false);
        } catch (error: any) {
            console.error(error);
            toast.error("שגיאה בעדכון המשתמש: " + error.message);
            throw error;
        }
    };

    return (
        <div className="space-y-6">

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="חיפוש לפי שם, אימייל או טלפון..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                />
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">שם מלא</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">פרטי קשר</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">סטטוס ותפקיד</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {(user.first_name?.[0] || "")}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        הצטרף ב- {new Date(user.created_at).toLocaleDateString("he-IL")}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail size={16} className="text-slate-400" />
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone size={16} className="text-slate-400" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                {user.is_gabbai ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        <ShieldCheck size={12} />
                                                        גבאי מנהל
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        <User size={12} />
                                                        משתמש רגיל
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    {user.role === 'member' ? 'חבר רשום' : user.role || 'ללא תפקיד'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="ערוך פרטים"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="מחק משתמש"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        לא נמצאו משתמשים התואמים את החיפוש
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards - Visible only on Mobile */}
            <div className="md:hidden space-y-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {(user.first_name?.[0] || "")}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        <div className="text-xs text-slate-500">
                                            הצטרף ב- {new Date(user.created_at).toLocaleDateString("he-IL")}
                                        </div>
                                    </div>
                                </div>
                                {user.is_gabbai && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                        <ShieldCheck size={12} />
                                        גבאי
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={16} className="text-slate-400" />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={16} className="text-slate-400" />
                                        {user.phone}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        setEditingUser(user);
                                        setIsEditDialogOpen(true);
                                    }}
                                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold transition-colors text-sm"
                                >
                                    <Edit2 size={16} />
                                    עריכה
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors text-sm"
                                >
                                    <Trash2 size={16} />
                                    מחיקה
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">לא נמצאו משתמשים</p>
                    </div>
                )}
            </div>

            <UserEditDialog
                user={editingUser}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveUser}
            />
        </div>
    );
}
