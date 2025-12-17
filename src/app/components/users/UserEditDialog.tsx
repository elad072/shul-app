"use client";

import { useState, useEffect } from "react";
import { X, User, ShieldCheck } from "lucide-react";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    is_gabbai: boolean | null;
};

type Props = {
    user: Profile | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: Profile) => Promise<void>;
};

export default function UserEditDialog({ user, isOpen, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        }
    }, [user]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => prev ? { ...prev, [name]: checked } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save user", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">עריכת פרטי משתמש</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">שם פרטי</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">שם משפחה</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">לא ניתן לשנות כתובת אימייל</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">סוג חשבון</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`
                relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${!formData.is_gabbai ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
              `}>
                                <input
                                    type="radio"
                                    name="account_type"
                                    checked={!formData.is_gabbai}
                                    onChange={() => setFormData(prev => prev ? { ...prev, is_gabbai: false, role: 'member' } : null)}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white rounded-full shadow-sm">
                                    <User size={24} className={!formData.is_gabbai ? 'text-blue-600' : 'text-slate-400'} />
                                </div>
                                <span className="font-bold">משתמש רגיל</span>
                                <span className="text-xs opacity-75">גישה בסיסית לאפליקציה</span>
                            </label>

                            <label className={`
                relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.is_gabbai ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
              `}>
                                <input
                                    type="radio"
                                    name="account_type"
                                    checked={!!formData.is_gabbai}
                                    onChange={() => setFormData(prev => prev ? { ...prev, is_gabbai: true, role: 'admin' } : null)}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white rounded-full shadow-sm">
                                    <ShieldCheck size={24} className={formData.is_gabbai ? 'text-amber-500' : 'text-slate-400'} />
                                </div>
                                <span className="font-bold">גבאי מנהל</span>
                                <span className="text-xs opacity-75">הרשאות ניהול מלאות</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? "שומר..." : "שמור שינויים"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
