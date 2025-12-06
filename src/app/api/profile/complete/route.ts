import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, phone } = body;

    if (!first_name || !last_name || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // upsert profile for the authenticated user
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        first_name,
        last_name,
        phone,
        status: "pending",
        role: "member",
      },
      { onConflict: ["id"] }
    );

    if (error) {
      console.error("Profile upsert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}
