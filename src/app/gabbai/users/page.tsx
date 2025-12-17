import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "ניהול משתמשים | אזור גבאי",
};

export default async function UsersPage() {
    const supabase = await createSupabaseServer();

    // 1. Check permission again (although layout does it, good for safety)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    // 2. Fetch all profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching profiles:", error);
        return (
            <div className="p-8 text-center text-red-500">
                שגיאה בטעינת המשתמשים. נסה לרענן את הדף.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <a href="/gabbai" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowRight size={16} className="ml-1" />
                    חזרה לדשבורד
                </a>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">ניהול משתמשים</h1>
                <p className="mt-2 text-slate-600">
                    צפייה, עריכה ומחיקה של כל המשתמשים הרשומים במערכת
                </p>
            </div>

            <UsersTable initialUsers={profiles || []} />
        </div>
    );
}
