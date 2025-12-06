import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Body = {
  applicationId: string;
};

export async function POST(request: Request) {
  try {
    const { applicationId } = (await request.json()) as Body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. load application
    const { data: applications, error: fetchErr } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !applications) {
      console.error("Application fetch error", fetchErr);
      return NextResponse.json(
        { error: fetchErr?.message || "Application not found" },
        { status: 404 }
      );
    }

    const app = applications as any;

    // 2. insert family
    const { data: familyData, error: familyErr } = await supabase
      .from("families")
      .insert([
        {
          family_name: app.family_name,
          address: app.address,
          city: app.city,
          home_phone: app.home_phone,
          active: true,
          created_by: null,
          updated_by: null,
        },
      ])
      .select("id")
      .single();

    if (familyErr || !familyData) {
      console.error("Family insert error", familyErr);
      return NextResponse.json(
        { error: familyErr?.message || "Failed to create family" },
        { status: 500 }
      );
    }

    const familyId = (familyData as any).id;

    // 3. insert member
    const { data: memberData, error: memberErr } = await supabase
      .from("members")
      .insert([
        {
          family_id: familyId,
          first_name: app.applicant_first_name,
          last_name: app.applicant_last_name || null,
          role: app.applicant_role || "head",
          gender: app.applicant_gender || "male",
          email: app.applicant_email || null,
          phone: app.applicant_phone || null,
          birth_date: app.birth_date || null,
          is_student: false,
        },
      ])
      .select("id")
      .single();

    if (memberErr || !memberData) {
      console.error("Member insert error", memberErr);
      return NextResponse.json(
        { error: memberErr?.message || "Failed to create member" },
        { status: 500 }
      );
    }

    const memberId = (memberData as any).id;

    // 4. update application status
    const { error: appUpdateErr } = await supabase
      .from("applications")
      .update({ status: "active" })
      .eq("id", applicationId);

    if (appUpdateErr) {
      console.error("Applications update error", appUpdateErr);
      return NextResponse.json(
        { error: appUpdateErr.message },
        { status: 500 }
      );
    }

    // 5. update profile if exists (match by email)
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ status: "active", member_id: memberId })
      .eq("email", app.applicant_email);

    if (profileErr) {
      // non-fatal, log and continue
      console.warn("Profile update warning", profileErr);
    }

    return NextResponse.json({ ok: true, familyId, memberId });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
