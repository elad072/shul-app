import { redirect } from "next/navigation";

export default function Home() {
  // הפניה מיידית לדשבורד
  // (המידלוואר יחסום אם המשתמש לא מחובר וישלח אותו להתחברות)
  redirect("/dashboard");
}
