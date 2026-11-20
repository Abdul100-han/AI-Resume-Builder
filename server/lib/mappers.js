// Supabase rows use snake_case columns; the React frontend uses camelCase.
// Every controller converts through these helpers so the two never mix.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Replaces Mongo's ObjectId validation: a malformed id is a 404, not a Postgres error.
export const isUuid = (value) => UUID_RE.test(String(value || ''))

const arrayOr = (value) => (Array.isArray(value) ? value : [])
const objectOr = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

// Copy only the keys that are present, renaming camelCase -> snake_case.
function pick(source, mapping) {
  const row = {}
  for (const [camel, snake] of Object.entries(mapping)) {
    if (source[camel] !== undefined) row[snake] = source[camel]
  }
  return row
}

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
const USER_COLUMNS = {
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  personalInfo: 'personal_info',
  education: 'education',
  experience: 'experience',
  skills: 'skills',
  studentProfile: 'student_profile',
}

// Column list for queries that must never return the password hash.
export const USER_PUBLIC_FIELDS =
  'id, name, email, role, personal_info, education, experience, skills, student_profile, created_at, updated_at'

export function userFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    personalInfo: objectOr(row.personal_info),
    education: arrayOr(row.education),
    experience: arrayOr(row.experience),
    skills: arrayOr(row.skills),
    studentProfile: objectOr(row.student_profile),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const userToRow = (user) => pick(user, USER_COLUMNS)

// ---------------------------------------------------------------------------
// resumes
// ---------------------------------------------------------------------------
const RESUME_COLUMNS = {
  userId: 'user_id',
  resumeId: 'resume_id',
  title: 'title',
  themeColor: 'theme_color',
  template: 'template',
  firstName: 'first_name',
  lastName: 'last_name',
  jobTitle: 'job_title',
  address: 'address',
  phone: 'phone',
  email: 'email',
  summery: 'summery',
  experience: 'experience',
  education: 'education',
  skills: 'skills',
}

export function resumeFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    resumeId: row.resume_id,
    title: row.title,
    themeColor: row.theme_color,
    template: row.template || 'classic',
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    jobTitle: row.job_title ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    summery: row.summery ?? '',
    experience: arrayOr(row.experience),
    education: arrayOr(row.education),
    skills: arrayOr(row.skills),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const resumeToRow = (resume) => pick(resume, RESUME_COLUMNS)

// ---------------------------------------------------------------------------
// job_vacancies
// ---------------------------------------------------------------------------
const JOB_COLUMNS = {
  jobTitle: 'job_title',
  company: 'company',
  description: 'description',
  requiredSkills: 'required_skills',
  postedDate: 'posted_date',
  postedBy: 'posted_by',
}

export function jobFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    jobTitle: row.job_title,
    company: row.company,
    description: row.description,
    requiredSkills: arrayOr(row.required_skills),
    postedDate: row.posted_date,
    postedBy: row.posted_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const jobToRow = (job) => pick(job, JOB_COLUMNS)

// Throw the Supabase error (if any) and return the data.
export function unwrap({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}
