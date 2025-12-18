-- פתרון לבעיית ה-Foreign Key בטבלת Profiles
-- מאפשר הוספת חברים ללא חשבון משתמש (Auth)

-- 1. הסרת האילוץ שמחייב כל פרופיל להיות מקושר למשתמש במערכת ה-Auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. הוספת הערה להסבר
COMMENT ON COLUMN public.profiles.id IS 'מזהה הפרופיל. בדרך כלל מגיע מ-auth.users, אך יכול להיות UUID עצמאי עבור אורחים.';

-- 3. וידוא הרשאות לגבאים לנהל את טבלת הפרופילים
-- (יש להריץ אם ה-Server Action נכשל על הרשאות)
DROP POLICY IF EXISTS "Gabbais can manage all profiles" ON public.profiles;
CREATE POLICY "Gabbais can manage all profiles"
ON public.profiles
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_gabbai = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_gabbai = true
  )
);

-- 4. אפשרות לכולם לראות את הפרופילים (בשביל בחירה בשיבוץ)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
