export default function DashboardPage() {
  return (
    <div dir="rtl" className="space-y-8">

      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">ברוך הבא</h1>
        <p className="text-sm text-gray-500">
          ברוכים הבאים למערכת ניהול בית הכנסת
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="card flex flex-col gap-2">
          <span className="text-gray-500 text-sm">סה"כ חברים</span>
          <span className="text-3xl font-bold text-gray-900">0</span>
        </div>

        <div className="card flex flex-col gap-2">
          <span className="text-gray-500 text-sm">בתי אב</span>
          <span className="text-3xl font-bold text-gray-900">0</span>
        </div>

        <div className="card flex flex-col gap-2">
          <span className="text-gray-500 text-sm">אירועים קרובים</span>
          <span className="text-3xl font-bold text-gray-900">0</span>
        </div>
      </section>

      {/* Notifications */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">הודעות</h2>
        <p className="text-gray-500 text-sm">אין הודעות כרגע</p>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">פעולות מהירות</h2>

        <div className="card flex items-center justify-between">
          <span className="text-gray-700 font-medium">הוספת חבר חדש</span>
          <a href="/dashboard/members/add" className="btn btn-sm">
            +
          </a>
        </div>
      </section>

    </div>
  );
}
