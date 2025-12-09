import Form from "./Form";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profile) {
    redirect("/pending");
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">ברוך הבא!</h1>
      <p className="mb-6 text-gray-600">אנא השלם את פרטי החשבון.</p>
      <Form userId={session.user.id} email={session.user.email!} />
    </div>
  );
}
