'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export interface TorahReadingAssignment {
    id: string;
    gregorian_date: string;
    hebrew_date: string;
    parasha_name: string;
    year: number;
    assigned_user_id: string | null;
    assigned_name: string | null;
    is_self_assigned: boolean;
    assigned_by_gabbai_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Get all Torah reading assignments for a specific year
 */
export async function getTorahReadings(year: number) {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
        .from('torah_readings')
        .select('*')
        .eq('year', year)
        .order('gregorian_date', { ascending: true });

    if (error) {
        console.error('Error fetching torah readings:', error);
        return [];
    }

    return data as TorahReadingAssignment[];
}

/**
 * Self-assign current user to a Torah reading
 */
export async function selfAssignTorahReading(
    gregorianDate: string,
    hebrewDate: string,
    parashaName: string,
    year: number
) {
    const supabase = await createSupabaseServer();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'לא מחובר' };
    }

    // Get user profile for name
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return { success: false, error: 'פרופיל לא נמצא' };
    }

    const fullName = `${profile.first_name} ${profile.last_name}`;

    // Check if already assigned
    const { data: existing } = await supabase
        .from('torah_readings')
        .select('*')
        .eq('gregorian_date', gregorianDate)
        .eq('year', year)
        .single();

    if (existing) {
        return { success: false, error: 'הפרשה כבר משובצת' };
    }

    // Insert assignment
    const { error } = await supabase
        .from('torah_readings')
        .insert({
            gregorian_date: gregorianDate,
            hebrew_date: hebrewDate,
            parasha_name: parashaName,
            year: year,
            assigned_user_id: user.id,
            assigned_name: fullName,
            is_self_assigned: true,
        });

    if (error) {
        console.error('Error self-assigning:', error);
        return { success: false, error: 'שגיאה בשיבוץ' };
    }

    revalidatePath('/dashboard/torah-readings');
    revalidatePath('/gabbai/torah-readings');

    return { success: true };
}

/**
 * Remove self-assignment
 */
export async function removeSelfAssignment(readingId: string) {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'לא מחובר' };
    }

    // Delete only if it's user's own assignment
    const { error } = await supabase
        .from('torah_readings')
        .delete()
        .eq('id', readingId)
        .eq('assigned_user_id', user.id)
        .eq('is_self_assigned', true);

    if (error) {
        console.error('Error removing assignment:', error);
        return { success: false, error: 'שגיאה במחיקת השיבוץ' };
    }

    revalidatePath('/dashboard/torah-readings');
    revalidatePath('/gabbai/torah-readings');

    return { success: true };
}

/**
 * Gabbai: Assign a registered user to a Torah reading
 */
export async function gabbaiAssignUser(
    gregorianDate: string,
    hebrewDate: string,
    parashaName: string,
    year: number,
    userId: string,
    notes?: string
) {
    const supabase = await createSupabaseServer();

    // Verify gabbai
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'לא מחובר' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_gabbai')
        .eq('id', user.id)
        .single();

    if (!profile?.is_gabbai) {
        return { success: false, error: 'אין הרשאה' };
    }

    // Get assigned user's name
    const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

    if (!assignedProfile) {
        return { success: false, error: 'משתמש לא נמצא' };
    }

    const fullName = `${assignedProfile.first_name} ${assignedProfile.last_name}`;

    // Upsert assignment
    const { error } = await supabase
        .from('torah_readings')
        .upsert({
            gregorian_date: gregorianDate,
            hebrew_date: hebrewDate,
            parasha_name: parashaName,
            year: year,
            assigned_user_id: userId,
            assigned_name: fullName,
            is_self_assigned: false,
            assigned_by_gabbai_id: user.id,
            notes: notes || null,
        }, {
            onConflict: 'gregorian_date,year'
        });

    if (error) {
        console.error('Error assigning user:', error);
        return { success: false, error: 'שגיאה בשיבוץ' };
    }

    revalidatePath('/dashboard/torah-readings');
    revalidatePath('/gabbai/torah-readings');

    return { success: true };
}

/**
 * Gabbai: Assign a non-registered person (free text) and auto-create profile
 */
export async function gabbaiAssignNewMember(
    gregorianDate: string,
    hebrewDate: string,
    parashaName: string,
    year: number,
    firstName: string,
    lastName: string,
    phone?: string,
    notes?: string
) {
    const supabase = await createSupabaseServer();

    // Verify gabbai
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'לא מחובר' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_gabbai')
        .eq('id', user.id)
        .single();

    if (!profile?.is_gabbai) {
        return { success: false, error: 'אין הרשאה' };
    }

    // Generate IDs
    const profileId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Create member record first (Gabbai is the creator)
    const { error: memberError } = await supabaseAdmin
        .from('members')
        .insert({
            id: memberId,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            role: 'head',
            gender: 'male',
            tribe: 'yisrael',
            created_by: user.id,
            updated_by: user.id,
        });

    if (memberError) {
        console.error('Error creating member record:', memberError);
        return { success: false, error: 'שגיאה ביצירת רשומת חבר' };
    }

    // 2. Create profile and link to member
    const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: profileId,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            role: 'member',
            status: 'approved',
            onboarding_completed: true,
            member_id: memberId,
            is_gabbai: false,
        })
        .select()
        .single();

    if (profileError || !newProfile) {
        console.error('Error creating profile:', profileError);
        // Better error message for the specific FK problem if they haven't run the SQL fix
        if (profileError?.code === '23503') {
            return {
                success: false,
                error: 'שגיאה בבסיס הנתונים: יש להריץ את קובץ ה-SQL לתיקון (fix_profiles_id_fkey.sql) כדי לאפשר הוספת חברים ללא חשבון.'
            };
        }
        return { success: false, error: 'שגיאה ביצירת פרופיל עבור החבר החדש' };
    }

    const fullName = `${firstName} ${lastName}`;

    // Assign to Torah reading
    const { error: assignError } = await supabase
        .from('torah_readings')
        .upsert({
            gregorian_date: gregorianDate,
            hebrew_date: hebrewDate,
            parasha_name: parashaName,
            year: year,
            assigned_user_id: newProfile.id,
            assigned_name: fullName,
            is_self_assigned: false,
            assigned_by_gabbai_id: user.id,
            notes: notes || null,
        }, {
            onConflict: 'gregorian_date,year'
        });

    if (assignError) {
        console.error('Error assigning new member:', assignError);
        return { success: false, error: 'שגיאה בשיבוץ' };
    }

    revalidatePath('/dashboard/torah-readings');
    revalidatePath('/gabbai/torah-readings');

    return {
        success: true,
        newMemberName: fullName,
        message: `${fullName} נוסף כחבר חדש ושובץ לקריאת התורה`
    };
}

/**
 * Gabbai: Remove any assignment
 */
export async function gabbaiRemoveAssignment(readingId: string) {
    const supabase = await createSupabaseServer();

    // Verify gabbai
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'לא מחובר' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_gabbai')
        .eq('id', user.id)
        .single();

    if (!profile?.is_gabbai) {
        return { success: false, error: 'אין הרשאה' };
    }

    const { error } = await supabase
        .from('torah_readings')
        .delete()
        .eq('id', readingId);

    if (error) {
        console.error('Error removing assignment:', error);
        return { success: false, error: 'שגיאה במחיקת השיבוץ' };
    }

    revalidatePath('/dashboard/torah-readings');
    revalidatePath('/gabbai/torah-readings');

    return { success: true };
}

/**
 * Get all registered users for assignment dropdown
 */
export async function getAllUsers() {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .order('first_name', { ascending: true });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data;
}
