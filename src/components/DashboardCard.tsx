"use client";

import Link from "next/link";

export default function DashboardCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        block p-6 bg-white rounded-xl border border-gray-200 shadow-sm 
        transition-all duration-200
        hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1
      "
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div
          className="
            w-12 h-12 flex items-center justify-center rounded-xl 
            bg-indigo-50 text-indigo-600 text-xl shadow-inner
          "
        >
          {icon}
        </div>

        {/* Text Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </Link>
  );
}
