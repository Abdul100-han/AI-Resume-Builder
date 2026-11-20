import { getSupabase } from '../config/db.js'
import { skillsFromSummary } from '../lib/studentProfile.js'
import { rankJobs, WEIGHTS } from '../lib/nlpMatcher.js'
import { isUuid, resumeFromRow, unwrap } from '../lib/mappers.js'
import { findUserByEmail, normalizeEmail } from '../lib/userStore.js'
import { listJobs } from './jobController.js'

const skillName = (skill) => String(typeof skill === 'string' ? skill : skill?.name || '').trim()

async function latestResume(userId) {
  const row = unwrap(await getSupabase()
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle())
  return resumeFromRow(row)
}

// Collect everything the NLP matcher can learn about a student:
// skills (latest CV + account + profile summary), department, target roles and free text.
async function studentForEmail(email) {
  const user = await findUserByEmail(email)
  if (!user) return { skills: [], department: '', targetRoles: '', profileText: '' }

  const latest = await latestResume(user.id)
  const profile = user.studentProfile || {}

  const skills = [
    ...(latest?.skills || []),
    ...(user.skills || []),
    ...skillsFromSummary(profile.skillsSummary),
  ].map(skillName).filter(Boolean)
  const uniqueSkills = [...new Map(skills.map((s) => [s.toLowerCase(), s])).values()]

  const education = [...(latest?.education || []), ...(user.education || [])]
    .map((e) => [e.degree, e.major, e.universityName, e.description].join(' '))
  const experience = [...(latest?.experience || []), ...(user.experience || [])]
    .map((e) => [e.title, e.companyName, e.workSummery].join(' '))

  return {
    skills: uniqueSkills,
    department: profile.department || '',
    targetRoles: [profile.targetRoles, latest?.jobTitle, user.personalInfo?.jobTitle].filter(Boolean).join(', '),
    profileText: [latest?.summery, ...education, ...experience].filter(Boolean).join(' . '),
  }
}

const requireEmail = (req, res) => {
  const email = normalizeEmail(req.query.email)
  if (!email) res.status(400).json({ message: 'email is required' })
  return email
}

export const matchJobs = async (req, res) => {
  try {
    const email = requireEmail(req, res)
    if (!email) return undefined

    const [student, jobs] = await Promise.all([studentForEmail(email), listJobs()])

    return res.json({
      skills: student.skills,
      department: student.department,
      weights: WEIGHTS,
      results: rankJobs(student, jobs),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const matchOneJob = async (req, res) => {
  try {
    const email = requireEmail(req, res)
    if (!email) return undefined
    if (!isUuid(req.params.id)) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }

    // IDF is computed over every vacancy so scores agree with the list view.
    const [student, jobs] = await Promise.all([studentForEmail(email), listJobs()])
    const result = rankJobs(student, jobs).find((r) => r.job.id === req.params.id)
    if (!result) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }

    return res.json({ skills: student.skills, ...result })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
