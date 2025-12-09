"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function updateMember(data: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const phone = data.get("phone") as string;

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      firstName,
      lastName,
      phone,
      status: "pending_approval",
    },
  });

  return { success: true };
}
