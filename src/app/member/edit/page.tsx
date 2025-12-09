import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateMember } from "@/lib/actions/updateMember";

export default async function EditMemberPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile?.status === "pending_approval") redirect("/pending");
  if (profile?.status === "rejected") redirect("/rejected");

  return (
    <form action={updateMember} className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">פרטים אישיים</h1>

      <input
        name="firstName"
        placeholder="שם"
        defaultValue={profile?.firstName ?? ""}
        className="border p-2 w-full rounded"
      />

      <input
        name="lastName"
        placeholder="שם משפחה"
        defaultValue={profile?.lastName ?? ""}
        className="border p-2 w-full rounded"
      />

      <input
        name="phone"
        placeholder="טלפון"
        defaultValue={profile?.phone ?? ""}
        className="border p-2 w-full rounded"
      />

      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
        שלח לאישור
      </button>
    </form>
  );
}
