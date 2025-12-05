import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // basic validation
    if (!body.familyName || !body.firstName || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // get current authenticated user (if any) to tie application to auth id
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    // check for existing pending application by auth id or email
    if (user?.id || body.email) {
      const query = supabase
        .from("applications")
        .select("id,status")
        .or(`applicant_auth_id.eq.${user?.id},applicant_email.eq.${body.email}`)
        .eq("status", "pending");

      const { data: existing, error: existingErr } = await query;

      if (existingErr) {
        console.error("Error checking existing applications", existingErr);
      } else if (existing && existing.length > 0) {
        // user already has a pending application
        return NextResponse.json(
          { message: "הפרטים שלך נמצאים בבדיקה וממתינים לאישור הגבאי" },
          { status: 409 }
        );
      }
    }

    const now = new Date().toISOString();

    const insertRow: any = {
      family_name: body.familyName,
      address: body.address || null,
      city: body.city || null,
      home_phone: body.homePhone || null,
      applicant_first_name: body.firstName,
      applicant_last_name: body.lastName || null,
      applicant_email: body.email,
      applicant_phone: body.phone || null,
      applicant_role: body.role || null,
      applicant_gender: body.gender || null,
      birth_date: body.birthDate || null,
      additional_info: body.additionalInfo
        ? JSON.stringify({ text: body.additionalInfo })
        : null,
      status: "pending",
      created_at: now,
    };

    if (user?.id) insertRow.applicant_auth_id = user.id;

    // try insert; if DB doesn't have applicant_auth_id column (migration not run), retry without it
    let insertResult = await supabase.from("applications").insert([insertRow]);

    if (insertResult.error) {
      console.error("Insert application error", insertResult.error);

      const errText = (
        insertResult.error.message || "" + JSON.stringify(insertResult.error)
      ).toString();
      if (errText.toLowerCase().includes("applicant_auth_id")) {
        // remove the column and retry
        delete insertRow.applicant_auth_id;
        insertResult = await supabase.from("applications").insert([insertRow]);
        if (insertResult.error) {
          console.error(
            "Retry insert without applicant_auth_id failed",
            insertResult.error
          );
          return NextResponse.json(
            { error: insertResult.error.message },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: insertResult.error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      id: insertResult.data?.[0]?.id ?? null,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
