import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_gabbai")
    .eq("id", user.id)
    .single();

  if (!profile?.is_gabbai) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content } = await req.json();

  const toPhone = process.env.WHATSAPP_DEV_PHONE!;
  const body = `📢 *${title}*\n\n${content}`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: "whatsapp:+14155238886",
        To: `whatsapp:${toPhone}`,
        Body: body,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(err);
    return NextResponse.json({ error: "Twilio error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
