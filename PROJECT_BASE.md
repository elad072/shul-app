
cat > PROJECT_BASE.md << 'EOF'
# Shul App — Project Base Document

## 📌 Description
A synagogue membership and management platform for “מעון קודשך”.
Users authenticate via Google OAuth, complete onboarding, await approval by a gabbai, and then receive access to the system.

Technology stack:  
Next.js 16 (Turbopack) • TypeScript • TailwindCSS • Supabase (Auth, DB, RLS)

---

## ✔ Current Status (Working Features)

### Authentication
- Google OAuth login works via Supabase Auth.
- Login creates:
  - a profile record
  - a member record (via onboarding form)
- JWT token is received client-side and sent to a server action.
- Server decodes JWT using a custom `decodeToken` function.

### Server Actions
- Server Actions operate correctly under Next.js 16.
- All previous issues with Turbopack, imports, and TypeScript have been resolved.

### Database Insert
- `addMember` Server Action inserts successfully to `members` using `supabaseAdmin`.
- `supabaseAdmin` uses `SUPABASE_SERVICE_ROLE_KEY` to bypass all RLS restrictions (as intended).

---

## 🟦 Development Environment
- Running inside **GitHub Codespaces** (cloud environment).
- Public dev URL example:
  `https://scaling-disco-g6v9rqxwggc57p-3000.app.github.dev`
- Vercel deployment planned later.

---

## 🟧 Supabase Integration

### Environment Variables (final corrected version)

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=...

SUPABASE_SERVICE_ROLE_KEY=...
\`\`\`

### Supabase Clients

- `supabaseClient.ts` → client-side operations  
- `supabaseAdmin.ts` → server-side, bypass RLS  
- `supabaseServer.ts` → alternative server client (not active)

### JWT Decode
File: `src/lib/auth/decodeToken.ts`

Used by server actions to extract user id (sub).

---

## 🟨 Database Schema Overview

### Table: members

\`\`\`
id (uuid, primary key)
first_name
last_name
role (enum: head, ...)
gender
email
phone
created_at (timestamp)
updated_at (timestamp)
created_by (uuid → auth.users.id)
updated_by (uuid)
\`\`\`

### RLS Policies

| Policy Name                                 | Command | Role            | Logic                            |
|---------------------------------------------|---------|------------------|----------------------------------|
| Allow read access for authenticated users   | SELECT  | authenticated    | qual = true                      |
| allow insert for authenticated users        | INSERT  | authenticated    | auth.uid() = created_by          |

➡ Because of this, `insert` requires SERVICE ROLE KEY.

---

## 📁 Important Pages in Next.js

\`\`\`
src/app/
  sign-in/page.tsx          → Login
  dashboard/page.tsx        → User dashboard
  member/edit/page.tsx      → Registration form
  pending/page.tsx          → Waiting for approval
  rejected/page.tsx         → Rejected account
  admin/                    → Gabbai dashboard (to be implemented)
  members-test/page.tsx     → Test page for server actions
\`\`\`

---

## 🟣 Server Actions (existing)

\`\`\`
addMember.ts         → Works (post-RLS fix)
updateMember.ts      → Exists but not active
testInsert.ts        → Removed
\`\`\`

---

## 🎯 Project Roadmap

### 1️⃣ Status Flow ("Pending Approval")
- After registration → set `status = pending_approval`
- Redirect user to `/pending`
- Prevent editing profile while pending
- Prevent login from re-showing form

### 2️⃣ Gabbai Admin Interface
- Dashboard for all pending users
- Approve → status = approved + timestamp
- Reject → status = rejected
- Only users with `is_gabbai = true` can access admin

### 3️⃣ Full UI/UX Redesign (RTL + mobile)
- Login page
- Registration form
- Pending screen
- Rejected screen
- Admin dashboard
- User dashboard

### 4️⃣ Authorization & Routing Logic
- no session → redirect to sign-in  
- incomplete onboarding → redirect to /member/edit  
- pending → redirect to /pending  
- rejected → redirect to /rejected  
- normal user → no access to /admin  
- gabbai → full access to admin dashboard  

---

## ✔ Current Status
🔹 Supabase connected  
🔹 Server actions working  
🔹 RLS bypass fixed  
🔹 Members insert working  
🔹 System ready for Stage 1 implementation  

