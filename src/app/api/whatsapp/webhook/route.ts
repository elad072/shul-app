import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * WhatsApp Webhook Endpoint
 * GET: Verification
 * POST: Handle incoming messages
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "shul_app_webhook_verify_token";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
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

        // Check if it's a message event
        if (
            body.object === "whatsapp_business_account" &&
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from; // Sender's phone number
            const text = message.text?.body;

            if (text) {
                console.log(`Received message from ${from}: ${text}`);

                // 1. Identify User
                const supabase = getSupabaseAdmin();
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("first_name, last_name")
                    .or(`phone.eq.${from},phone.eq.+${from},phone.eq.0${from.slice(-9)}`) // Try to match phone patterns
                    .single();

                let responseMessage = "";
                if (profile) {
                    responseMessage = `שלום ${profile.first_name} ${profile.last_name || ""}, אתה מחובר למערכת הגבאי!`;
                } else {
                    responseMessage = `שלום, המספר שלך (${from}) אינו מזוהה במערכת שלנו.`;
                }

                // 2. Reply via WhatsApp API
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
                            text: { body: responseMessage },
                        }),
                    });
                } else {
                    console.error("Missing WhatsApp credentials in environment variables");
                }
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
