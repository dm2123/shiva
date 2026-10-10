# THE SHIVA — EdTech Platform

Next.js 14 + MySQL learning platform for competitive-examination preparation (SSC, Railway, Banking, Defence, Teaching). Three role-based portals (Admin, Teacher, Student) plus a public marketing site.

## Stack

- Next.js 14 (App Router, RSC + client components)
- MySQL 8 via `mysql2` (authoritative store), Redis optional (caching/session store)
- TypeScript, Zod validation, bcryptjs, Tailwind, GSAP/Three.js (student UI effects)
- Capacitor Android shell (WebView app that loads the hosted web app)

## Setup

1. **Database** — create the schema and load seed data:

   ```bash
   mysql -u root -p < init_db_full.sql
   mysql -u root -p the_shiva < seed_db.sql
   mysql -u root -p the_shiva < seed_features.sql
   ```

   > `seed_db.sql` deletes existing rows first, so re-running it resets the app to pristine demo data.

2. **Environment** — copy `.env.example` to `.env` and fill in the values (`MYSQL_DATABASE=the_shiva`, default user `root`). Set a strong `SESSION_SECRET`, and real values for Google OAuth, Gmail SMTP (OTP) and Razorpay if those features are used.

3. **Run**

   ```bash
   npm install
   npm run dev   # http://localhost:3000
   npm run build # production build
   ```

## Demo Login Credentials

Password verification is **enabled** (bcrypt). All seeded accounts use the password:

> **Password: `Demo@1234`**

| Role    | Email                      | Name / Notes            |
| ------- | -------------------------- | ----------------------- |
| Admin   | `admin@shiva.com`          | Super admin             |
| Teacher | `shivajay.sir@shiva.com`   | Shivajay Sir (Founder)  |
| Teacher | `priyanka.mam@shiva.com`   | Priyanka Ma'am          |
| Teacher | `ap.sir@shiva.com`         | A.P. Sir                |
| Teacher | `vikas.sir@shiva.com`      | Vikas Sir               |
| Teacher | `rajat.sir@shiva.com`      | Rajat Sir               |
| Student | `rahul.gupta@example.com`  | Enrolled in SSC CGL     |
| Student | `neha.agarwal@example.com` | Enrolled in free course |

> Change these passwords before any real deployment. Seeded hashes live in `seed_db.sql`.

Portals: `/admin` (admin), `/teacher` (teacher), `/app` (student). Student/teacher registration supports both password and OTP flows.

## Security Notes

- Passwords are hashed with bcrypt and verified on every login.
- OTP sessions are rate-limited and expire after 5 minutes; no master/backdoor OTP.
- Login attempts are rate-limited (failed attempts lock the identifier temporarily).
- Admin provisioning is environment-driven (`ADMIN_PROVISION_*`) and blocked in production.
- Paid enrollment requires a verified Razorpay signature; there is no demo/free checkout in production paths.
- Secrets are read from environment variables only — never hardcoded.

## Quick Tour

- **Public**: `/(public)` — home, course catalog + syllabus, teachers, batches — all served from MySQL.
- **Student**: `/app` dashboard (enrolled courses, progress bars, upcoming live classes, pending doubts), `/app/learn/[courseId]` classroom (lecture playback persists progress), `/app/courses` catalog shows enrollment badges.
- **Teacher**: `/teacher` dashboard (assigned courses, live doubt count), `/teacher/doubts` resolve workflow.
- **Admin**: `/admin` — operational dashboard (revenue, enrollments, orders), students directory, enrollments (batch/status), teacher provisioning + course assignment, course management.
- **Health**: `GET /api/health` — DB connectivity, latency, uptime, and table counts.

## Android App (Capacitor)

The Android app is a WebView shell that loads the full web app from a server URL (the Next.js/MySQL backend cannot run inside the APK).

```bash
# point the app at your deployed backend, then sync + build
$env:APP_SERVER_URL="https://your-domain.com"
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Edit `SERVER_URL` in `capacitor.config.ts` if you prefer it committed rather than passed via env.

## Key Data Notes

- `Users.password` stores the bcrypt hash (read as `passwordHash` in service mappings).
- `TeacherCourseAssignments.teacherId` stores the **Users.id** of the teacher (join on `TeacherProfiles.userId`).
- Course URLs resolve by slug (`/courses/{slug}`) and by id.
- `Notification.type` is limited to `INFO | WARNING | SUCCESS | ERROR`.

## Testing / Lint

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest (truncates and reseeds the DB)
```

> `npm test` resets the database. Re-run `seed_db.sql` + `seed_features.sql` afterwards if you need demo data.
