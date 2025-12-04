import Sidebar from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // min-h-screen מבטיח שהדף יתפוס את כל הגובה
    // bg-gray-100 נותן רקע אפור בהיר ונעים לתוכן
    // rtl הופך את הכיוון לעברית
    <div className="flex min-h-screen bg-gray-50 rtl">
      {/* תפריט הצד - קבוע */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-md z-10">
        <Sidebar />
      </aside>

      {/* אזור התוכן הראשי - נגלל */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}
