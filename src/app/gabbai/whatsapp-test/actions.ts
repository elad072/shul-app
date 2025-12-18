"use server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function sendWhatsAppTestAction(userName: string) {
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const RECIPIENT_PHONE_NUMBER = "972542889950";

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        return {
            success: false,
            error: "Missing credentials in .env.local (WHATSAPP_PHONE_ID or WHATSAPP_API_TOKEN)"
        };
    }

    const url = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const body = {
        messaging_product: "whatsapp",
        to: RECIPIENT_PHONE_NUMBER,
        type: "template",
        template: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBotSettings() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("bot_settings")
        .select("value")
        .eq("key", "welcome_message")
        .single();

    return { data, error };
}

export async function updateBotSettings(welcomeMessage: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
        .from("bot_settings")
        .upsert({ key: "welcome_message", value: welcomeMessage, updated_at: new Date().toISOString() });

    if (error) return { success: false, error: error.message };

    revalidatePath("/gabbai/whatsapp-test");
    return { success: true };
}
