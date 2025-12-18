import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * WhatsApp Webhook Endpoint
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shul_app_webhook_verify_token";

const DAYS: Record<string, number | null> = {
    "ראשון": 0,
    "שני": 1,
    "שלישי": 2,
    "רביעי": 3,
    "חמישי": 4,
    "שישי": 5,
    "שבת": 6,
    "יום חול": null,
};

async function getPrayerTimes(dayKeyword: string) {
    const supabase = getSupabaseAdmin();
    const dayOfWeek = DAYS[dayKeyword];

    let query = supabase.from("schedules").select("title, time_of_day");

    if (dayOfWeek === null) {
        query = query.is("day_of_week", null);
    } else if (dayOfWeek !== undefined) {
        query = query.eq("day_of_week", dayOfWeek);
    } else {
        return null;
    }

    const { data, error } = await query.order("time_of_day");

    if (error || !data || data.length === 0) {
        return `לא נמצאו זמנים ל-${dayKeyword}.`;
    }

    const lines = data.map(s => `🕒 *${s.title}* – ${s.time_of_day.slice(0, 5)}`);
    return `🕍 *זמני תפילות – ${dayKeyword}*\n\n${lines.join("\n")}`;
}

async function getBotResponse(rawText: string, from: string, userName?: string) {
    const text = rawText.trim().toLowerCase();
    const supabase = getSupabaseAdmin();

    // 1. Check for specific day queries
    for (const day of Object.keys(DAYS)) {
        if (text.includes(day)) {
            const times = await getPrayerTimes(day);
            if (times) return times;
        }
    }

    // 2. Default: Fetch welcome message from bot_settings or fallback
    const { data: setting } = await supabase
        .from("bot_settings")
        .select("value")
        .eq("key", "welcome_message")
        .single();

    const welcome = setting?.value || `שלום ${userName || ''}! ברוך הבא לבית הכנסת.\nמה תרצה לדעת?\nאפשר לשאול על:\n📅 זמנים של שישי\n🕯 זמנים של שבת\n🗓 זמנים של יום חול`;

    return welcome;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return new Response(challenge, { status: 200 });
        } else {
            return new Response("Forbidden", { status: 403 });
        }
    }
    return new Response("Bad Request", { status: 400 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (
            body.object === "whatsapp_business_account" &&
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
        ) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from;
            const text = message.text?.body;

            if (text) {
                // Identify User
                const supabase = getSupabaseAdmin();
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name")
                    .or(`phone.eq.${from},phone.eq.+${from},phone.eq.0${from.slice(-9)}`)
                    .single();

                const responseText = await getBotResponse(text, from, profile?.first_name);

                // Reply
                const phoneId = process.env.WHATSAPP_PHONE_ID;
                const accessToken = process.env.WHATSAPP_API_TOKEN;

                if (phoneId && accessToken) {
                    await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            messaging_product: "whatsapp",
                            to: from,
                            type: "text",
                            text: { body: responseText },
                        }),
                    });
                }
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ ok: true }); // Always return 200 to WhatsApp to avoid retries
    }
}
