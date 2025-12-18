import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * WhatsApp Webhook Endpoint - AI Powered (GPT-4o-mini)
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shul_app_webhook_verify_token";

async function getSynagogueContext() {
    const supabase = getSupabaseAdmin();

    // 1. Fetch Schedules
    const { data: schedules } = await supabase
        .from("schedules")
        .select("title, time_of_day, day_of_week")
        .order("time_of_day");

    // 2. Fetch Latest Announcements
    const { data: announcements } = await supabase
        .from("announcements")
        .select("title, content")
        .order("created_at", { ascending: false })
        .limit(5);

    // 3. Fetch Upcoming Events
    const { data: events } = await supabase
        .from("community_events")
        .select("title, location, start_time")
        .order("start_time", { ascending: true })
        .limit(5);

    const daysHe = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    const context = `
בית הכנסת: מעון קודשך.

זמני תפילות:
${schedules?.map(s => `- ${s.title}: ${s.time_of_day.slice(0, 5)} (${s.day_of_week !== null ? daysHe[s.day_of_week] : 'יום חול/קבוע'})`).join("\n")}

הודעות אחרונות:
${announcements?.map(a => `- ${a.title}: ${a.content}`).join("\n")}

אירועים קרובים:
${events?.map(e => `- ${e.title} ב-${e.location} בתאריך ${e.start_time}`).join("\n")}
  `.trim();

    return context;
}

async function getAIResponse(userMessage: string, userName?: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return "שגיאת מערכת: מפתח AI חסר.";

    const context = await getSynagogueContext();
    const systemPrompt = `
אתה העוזר הדיגיטלי של בית הכנסת "מעון קודשך". 
תפקידך לענות לחברי הקהילה על שאלותיהם בצורה אדיבה, חמה ומכבדת בעברית.
השתמש במידע הבא כבסיס הבלעדי לתשובות שלך:
${context}

הנחיות:
1. אם פנו אליך בשם ${userName || 'משתמש'}, פנה אליו חזרה בנימוס.
2. אם שואלים על זמנים, פרט אותם בצורה ברורה.
3. אם שואלים על הודעות או אירועים, הצג את המעודכנים ביותר.
4. אם שואלים על משהו שלא מופיע במידע לעיל, ענה בנימוס שאינך יודע והצע לפנות לגבאי.
5. שמור על תשובות קצרות וקולעות שמתאימות ל-WhatsApp.
  `.trim();

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "מצטער, לא הצלחתי לעבד את הבקשה.";
    } catch (error) {
        console.error("AI Error:", error);
        return "מצטער, חלה שגיאה בחיבור לבינה המלאכותית.";
    }
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

                const responseText = await getAIResponse(text, profile?.first_name);

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
        return NextResponse.json({ ok: true });
    }
}
