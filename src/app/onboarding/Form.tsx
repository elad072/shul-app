"use client";

export default function Form({ profile }) {
  return (
    <form className="card">
      <p>שלום {profile?.first_name || "אורח"}, השלם בבקשה את הפרטים שלך.</p>

      {/* כאן ייכנסו כל השדות של ההשלמה */}
    </form>
  );
}
