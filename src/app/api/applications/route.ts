import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // basic validation
    if (!body.familyName || !body.firstName || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    const now = new Date().toISOString()

    const { data, error } = await supabase.from('applications').insert([{ 
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
      additional_info: body.additionalInfo ? JSON.stringify({ text: body.additionalInfo }) : null,
      status: 'pending',
      created_at: now,
    }])

    if (error) {
      console.error('Insert application error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.[0]?.id ?? null })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
