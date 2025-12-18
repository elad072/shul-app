-- שיפור תהליך המחיקה והשיבוץ
-- 1. הגדרת מחיקת נתונים קשורה (Cascade) בשיבוצי קריאה בתורה
ALTER TABLE public.torah_readings 
DROP CONSTRAINT IF EXISTS torah_readings_assigned_user_id_fkey,
ADD CONSTRAINT torah_readings_assigned_user_id_fkey 
  FOREIGN KEY (assigned_user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 2. הגדרת מחיקה קשורה באירועים אישיים (אם קיים - לפי שם הטבלה השכיח)
-- (נבדוק אם הטבלה נקראת personal_events או members)
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personal_events') THEN
    ALTER TABLE public.personal_events 
    DROP CONSTRAINT IF EXISTS personal_events_member_id_fkey,
    ADD CONSTRAINT personal_events_member_id_fkey 
      FOREIGN KEY (member_id) 
      REFERENCES public.members(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3. הגדרת מחיקה קשורה בבקשות קשר והודעות
ALTER TABLE public.contact_requests
DROP CONSTRAINT IF EXISTS contact_requests_user_id_fkey,
ADD CONSTRAINT contact_requests_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 4. תיקון RLS (למניעת רקורסיה כפי שעשינו קודם - ריענון למקרה הצורך)
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;
CREATE POLICY "Anyone can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Gabbais can update all profiles" ON public.profiles;
CREATE POLICY "Gabbais can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  (SELECT is_gabbai FROM public.profiles WHERE id = auth.uid()) = true
);
