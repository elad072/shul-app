-- תיקון דחוף למדיניות האבטחה (RLS) בטבלת Profiles
-- פותר את בעיית ה"לופ" וההפניה לדף ה-Onboarding

-- 1. ניקוי המדיניות הבעייתית שגרמה לרקורסיה (Recursion)
DROP POLICY IF EXISTS "Gabbais can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view all profiles for selection" ON public.profiles;

-- 2. אפשרות לכל משתמש מחובר לראות את כל הפרופילים (בשביל חיפוש ושיבוץ)
-- מדיניות SELECT פשוטה ללא תנאים מורכבים
CREATE POLICY "Anyone can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 3. אפשרות למשתמש לעדכן את הפרופיל של עצמו (קריטי ל-Onboarding)
CREATE POLICY "Users can manage own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. הרשאות לגבאים לנהל פרופילים אחרים
-- כדי למנוע רקורסיה, אנחנו משתמשים בתת-שאילתה פשוטה. 
-- הערה: הגבאים משתמשים ב-Service Role בשרת, אז זה בעיקר לגיבוי.
CREATE POLICY "Gabbais can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  (SELECT is_gabbai FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Gabbais can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  (SELECT is_gabbai FROM public.profiles WHERE id = auth.uid()) = true
);

-- 5. וידוא הגדרת הטבלה
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- הערה לגבי ה-FK (שכבר ביצענו):
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
