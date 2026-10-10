# THE SHIVA — EdTech Platform

Next.js 14 + MySQL learning platform for competitive-examination preparation (SSC, Railway, Banking, Defence, Teaching). Three role-based portals (Admin, Teacher, Student) plus a public marketing site.

## Stack

- Next.js 14 (App Router, RSC + client components)
- MySQL 8 via `mysql2` (authoritative store), Redis optional (caching/session store)
- TypeScript, Zod validation, bcryptjs, Tailwind, GSAP/Three.js (student UI effects)

## Setup

1. **Database** — create the schema and load seed data:

   ```bash
   mysql -u root -p < init_db_full.sql
   mysql -u root -p the_shiva < seed_db.sql
   ```

   > `seed_db.sql` deletes existing rows first, so re-running it resets the app to pristine demo data.

2. **Environment** — copy `.env.example` to `.env` and set `MYSQL_DATABASE=the_shiva` (default user `root`).

3. **Run**

   ```bash
   npm install
   npm run dev   # http://localhost:3000
   npm run build # production build (verified: 0 type errors)
   ```

## Demo Login Credentials

Password verification is globally disabled (demo bypass), so **any password works** for every account.

| Role    | Email                     | Name / Notes            |
| ------- | ------------------------- | ----------------------- |
| Admin   | `admin@shiva.com`         | Super admin             |
| Teacher | `shivajay.sir@shiva.com`  | Shivajay Sir (Founder)  |
| Teacher | `priyanka.mam@shiva.com`  | Priyanka Ma'am          |
| Teacher | `ap.sir@shiva.com`        | A.P. Sir                |
| Teacher | `vikas.sir@shiva.com`     | Vikas Sir               |
| Teacher | `rajat.sir@shiva.com`     | Rajat Sir               |
| Student | `rahul.gupta@example.com` | Enrolled in SSC CGL     |
| Student | `neha.agarwal@example.com`| Enrolled in free course |

Portals: `/admin` (admin), `/teacher` (teacher), `/app` (student). Registration keeps OTP flow intact (master OTP `000000` works).

## Demo Bypasses (intentional, for the demo)

All are clearly commented in code and safe to re-enable for production:

- `src/services/auth.service.ts` — password verification disabled so any password logs in.
- `src/services/auth-extended.service.ts` — OTP rate limiting off; master OTP `000000` accepted.
- Admin provisioning is env-driven and blocked in production.
- Paid-course enrollment uses a **DEMO checkout** (`/api/student/enrollments`): order is marked `SUCCESS` immediately and no payment is collected.

## Quick Tour

- **Public**: `/(public)` — home, course catalog + syllabus, teachers, batches — all served from MySQL.
- **Student**: `/app` dashboard (enrolled courses, progress bars, upcoming live classes, pending doubts), `/app/learn/[courseId]` classroom (lecture playback persists progress), `/app/courses` catalog shows enrollment badges.
- **Teacher**: `/teacher` dashboard (assigned courses, live doubt count), `/teacher/doubts` resolve workflow.
- **Admin**: `/admin` — operational dashboard (revenue, enrollments, orders), students directory, enrollments (batch/status), teacher provisioning + course assignment, course management.
- **Health**: `GET /api/health` — DB connectivity, latency, uptime, and table counts.

## Key Data Notes

- `TeacherCourseAssignments.teacherId` stores the **Users.id** of the teacher (join on `TeacherProfiles.userId`).
- Course URLs resolve by slug (`/courses/{slug}`) and by id.
- `Notification.type` is limited to `INFO | WARNING | SUCCESS | ERROR`.

## Testing / Lint

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest
```