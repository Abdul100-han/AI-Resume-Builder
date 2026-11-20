# AI Resume Builder with NLP Job Matching

**Final-year project. Case study: Kano State Polytechnic**

A web app where Kano State Polytechnic final-year students and recent graduates can:

1. Save a **student profile** (department, academic status, graduation year, target roles, skills). No password is needed.
2. Build a **CV** with AI-assisted summaries and bullet points (Google Gemini), choose between **two professional templates**, and export a clean **PDF**.
3. See **job vacancies ranked by NLP match score**, with matched, partly matched and missing skills and a plain-English reason for each score.

Admins log in to post, edit and delete vacancies.

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui      |
| Backend  | Node.js, Express, `@supabase/supabase-js`    |
| Database | Supabase (PostgreSQL)                        |
| AI / NLP | Gemini API (CV writing); custom TF-IDF + skill matcher (no external NLP library) |

---

## 1. Setup

**Requirements:** Node.js 18+ and a free [Supabase](https://supabase.com) project.

```bash
# 1. Install dependencies (frontend + backend)
npm install
npm install --prefix server

# 2. Environment files
cp .env.example .env                 # frontend: optional Gemini key for AI writing
cp server/.env.example server/.env   # backend: Supabase keys, JWT secret, admin login
```

**3. Create the tables.** In the Supabase dashboard, open **SQL Editor → New query**, paste [`server/supabase-schema.sql`](server/supabase-schema.sql) and click **Run**. It is safe to run again.

`server/.env` keys:

| Key | Default | Purpose |
|-----|---------|---------|
| `SUPABASE_URL` | — | Project URL (**Project Settings → API**) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | `service_role` secret key. Server only, never in the root `.env`. |
| `PORT` | `5000` | API port |
| `JWT_SECRET` | *(set your own)* | Signs admin login tokens |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `Admin` / `admin@local.dev` / `admin123` | Admin account, created automatically |

**Tables:** `users`, `resumes`, `job_vacancies`. Nested data (education, experience, skills, profile) is stored as `jsonb`. Row Level Security is on with no policies, so only the API (using the service role key) can read or write.

## 2. Seed the demo data

```bash
npm run seed              # adds anything missing; safe to run any number of times
npm run seed -- --reset   # also restores demo records edited during testing
```

The seed creates:

- **The admin account** from `server/.env`.
- **6 vacancies in Kano** for polytechnic graduates (company names are fictional):
  - Junior Software Developer
  - IT Support & Network Technician
  - Web Developer
  - Data & Operations Analyst
  - Electrical & Systems Trainee
  - Digital Marketing & Content Officer
- **2 student profiles, each with a CV:**

  | Student | Programme | CV template |
  |---|---|---|
  | Aisha Musa Bello (`aisha.bello@demo.local`) | HND Computer Science, Final-Year | Modern Sidebar |
  | Ibrahim Sani Yakubu (`ibrahim.yakubu@demo.local`) | HND Electrical Engineering, Recent Graduate | Classic Professional |

The seed only touches its own records. Vacancies are matched by title and company, students by email, and CVs by a fixed ID. It never deletes anything.

## 3. Run

Use two terminals:

```bash
npm run server   # API on http://localhost:5000
npm run dev      # app on http://localhost:5173
```

| What | Where |
|------|-------|
| **Admin login** | `/admin`, email `admin@local.dev`, password `admin123` (or your `server/.env` values) |
| **Demo students** | `/profile`, then **Demo accounts** (visible in development, or set `VITE_DEMO_MODE=true`) |
| **Job matches** | `/jobs` |

Students are identified by an email stored in the browser, so switching demo accounts simply changes that email.

## 4. Checks

```bash
npm test         # NLP matcher unit tests (server/lib/nlpMatcher.test.js)
npm run build    # production build of the frontend
```

---

## How the NLP matching works

Code: [`server/lib/nlpMatcher.js`](server/lib/nlpMatcher.js). It's called from [`server/controllers/matchController.js`](server/controllers/matchController.js).

**Inputs:**

- **Student:** skills (latest CV, account and profile), department, target roles, CV summary, education and experience.
- **Vacancy:** job title, description and required skills.

### Pipeline

1. **Normalisation:** text is lowercased, HTML stripped, `&` turned into "and", and punctuation cleaned. Characters that belong to tech names are kept, so `c++`, `c#`, `node.js` and `.net` survive.
2. **Alias mapping:** about 60 skills each map to one standard name, e.g. `js` → JavaScript, `nodejs`/`node` → Node.js, `ml` → Machine Learning, `postgres` → PostgreSQL. The longest phrase wins, so "React Native" is never read as "React".
3. **Tokenisation:** text is split into words, English stopwords and job-ad filler ("strong", "required", "experience") are removed, and plurals are reduced (`databases` → `database`).
4. **Skill matching:** skills are compared as whole words or whole phrases only. That is why **"Java" does not match "JavaScript"**: the old substring check matched them. Each required skill earns credit:

   | Credit | When | Example |
   |---|---|---|
   | 1.0 | Exact or alias match in the student's skills | `JS` for JavaScript |
   | 1.0 | Exact phrase found in the CV text | "following safety procedures" |
   | 1.0 | A specific skill proves a general one | MySQL ⇒ SQL ⇒ Database |
   | 0.5 | A closely related skill | PostgreSQL when MySQL is required |
   | 0 | Otherwise | Listed as missing |

   **Skill coverage = total credit ÷ number of required skills**

5. **TF-IDF and cosine similarity:** the vacancy text and the student profile become weighted word vectors.
   - **TF** (term frequency) = how often a term appears ÷ number of terms in the document
   - **IDF** (inverse document frequency) = ln((1 + N) / (1 + df)) + 1, where N is the number of documents and df is how many contain the term. Common words get low weight and specific words get high weight.
   - **Text similarity** = cosine(A, B) = (A·B) / (‖A‖ × ‖B‖), a value from 0 to 1
6. **Final score:**

   **Score = 100 × (0.70 × skill coverage + 0.30 × text similarity)**

   - If a vacancy has no required skills, the score uses text similarity alone.
   - **Bands:** Strong ≥ 75, Good 50–74, Fair 25–49, Low < 25.
   - Each result includes an explanation: skills met, skills inferred, top missing skills, whether the department is relevant, and the main shared terms.

**Limitations:** the matcher doesn't understand meaning, only listed synonyms. A word used in ordinary English can occasionally match a skill ("excel at teamwork"). The 70/30 weighting is a design choice, set in `WEIGHTS`.

---

## CV templates and PDF export

| Template | Layout |
|----------|--------|
| **Classic Professional** | Single column with a centred header. Works with any employer or applicant tracking system (ATS). |
| **Modern Sidebar** | Two columns: contact details and skill ratings in a tinted sidebar, then profile, education and experience. |

- **Choosing a template:** use **Template** in the CV editor or on the CV page. The choice is saved on the CV (`template` field on the `Resume` model).
- **Downloading:** **Download PDF** opens the browser print dialog. Choose **Save as PDF**, **A4**, margins **Default**.
- **Print styling:** the print CSS in [`src/index.css`](src/index.css):
  - hides the app header and buttons
  - keeps theme colours
  - stops entries from splitting across pages
  - repeats page padding on every page of a multi-page CV

## Project structure

```
server/
  supabase-schema.sql         tables, indexes, triggers (run in Supabase SQL Editor)
  seed.js                     demo data (Kano State Polytechnic)
  config/db.js                Supabase client
  lib/mappers.js              snake_case rows <-> camelCase API objects
  lib/userStore.js            shared user lookups
  lib/nlpMatcher.js           NLP pipeline + scoring
  lib/nlpMatcher.test.js      unit tests
  controllers/                auth, jobs, match, profile, resumes
src/
  profile/                    student profile + demo account switcher
  dashboard/resume/           CV editor, preview, templates/, TemplateSelector
  my-resume/[resumeId]/view/  CV page: template choice, PDF download, share
  jobs/                       ranked job matches
  admin/                      vacancy management
```
