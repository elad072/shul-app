import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import InboxClient from "./InboxClient";

export default async function GabbaiMessagesPage() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/sign-in");

    // Check Gabbai Permissions
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_gabbai")
        .eq("id", user.id)
        .single();

    if (!profile || !profile.is_gabbai) redirect("/dashboard");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">תיבת דואר נכנס</h1>
                <p className="text-slate-500">ניהול פניות ובקשות מחברי הקהילה</p>
            </div>

            <InboxClient currentUserId={user.id} />
        </div>
    );
}
