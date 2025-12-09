import { addMember } from "@/lib/actions/addMember";

export default function MembersTestPage() {
  return (
    <form action={addMember} className="space-y-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">הוספת חבר חדש</h1>

      <input name="first_name" placeholder="שם פרטי" className="border p-2 w-full" required />
      <input name="last_name" placeholder="שם משפחה" className="border p-2 w-full" />
      <input name="email" placeholder="אימייל" className="border p-2 w-full" />
      <input name="phone" placeholder="טלפון" className="border p-2 w-full" />

      <select name="gender" className="border p-2 w-full">
        <option value="male">זכר</option>
        <option value="female">נקבה</option>
      </select>

      <label className="flex gap-2 items-center">
        <input type="checkbox" name="is_student" />
        סטודנט?
      </label>

      <button className="bg-blue-600 text-white p-3 rounded w-full">
        הוסף חבר
      </button>
    </form>
  );
}
