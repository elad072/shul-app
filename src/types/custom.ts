// types/custom.ts
export interface MemberWithFamily {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  family_id: string | null;
  created_at: string;
  // הגדרת ה-Relation (המידע שמגיע מה-JOIN)
  families: {
    family_name: string;
    address: string | null;
  } | null;
}
