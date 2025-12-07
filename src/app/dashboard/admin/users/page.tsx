import { createClient } from "@/utils/supabase/server";
import ApproveButton from "./ApproveButton";
import { UserCheck, Clock } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">אישור משתמשים</h1>
        <p className="text-gray-500 mt-1">ניהול בקשות הצטרפות חדשות למערכת</p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Empty State */}
        {(!pending || pending.length === 0) && (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">הכל מעודכן!</h3>
            <p className="text-gray-500 mt-1">אין בקשות חדשות הממתינות לאישור.</p>
          </div>
        )}

        {/* Users List */}
        {pending && pending.length > 0 && (
          <div className="divide-y divide-gray-100">
            {pending.map((user) => (
              <div
                key={user.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                
                {/* User Details */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    {user.first_name?.[0]}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h3>

                    <div className="text-sm text-gray-500 mt-0.5 flex flex-col sm:flex-row sm:gap-4">
                      <span>{user.email}</span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span>{user.phone || "אין טלפון"}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                      <Clock size={12} />
                      ממתין לאישור
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <ApproveButton userId={user.id} />
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
