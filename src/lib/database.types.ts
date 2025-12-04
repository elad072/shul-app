export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          is_gabbai: boolean
          status: 'pending' | 'approved' | 'rejected'
          member_id: string | null
          last_sign_in_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_gabbai?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          member_id?: string | null
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          is_gabbai?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          member_id?: string | null
          last_sign_in_at?: string | null
        }
      }
      families: {
        Row: {
          id: string
          family_name: string
          address: string | null
          city: string | null
          home_phone: string | null
          active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          family_name: string
          address?: string | null
          city?: string | null
          home_phone?: string | null
          active?: boolean
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          family_name?: string
          address?: string | null
          city?: string | null
          home_phone?: string | null
          active?: boolean
          updated_by?: string | null
        }
      }
      members: {
        Row: {
          id: string
          family_id: string
          first_name: string
          last_name: string | null
          role: 'head' | 'spouse' | 'child' | 'other'
          gender: 'male' | 'female'
          email: string | null
          phone: string | null
          birth_date: string | null
          hebrew_birth_date: string | null
          is_student: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          first_name: string
          last_name?: string | null
          role?: 'head' | 'spouse' | 'child' | 'other'
          gender: 'male' | 'female'
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          hebrew_birth_date?: string | null
          is_student?: boolean
        }
        Update: {
          first_name?: string
          last_name?: string | null
          role?: 'head' | 'spouse' | 'child' | 'other'
          gender?: 'male' | 'female'
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          hebrew_birth_date?: string | null
          is_student?: boolean
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string | null
          is_pinned: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          is_pinned?: boolean
          expires_at?: string | null
          created_by?: string | null
        }
        Update: {
          title?: string
          content?: string | null
          is_pinned?: boolean
          expires_at?: string | null
        }
      }
    }
  }
}