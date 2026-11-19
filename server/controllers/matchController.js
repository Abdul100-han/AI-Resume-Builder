import JobVacancy from '../models/JobVacancy.js'
import Resume from '../models/Resume.js'
import User from '../models/User.js'
import { skillsFromSummary } from '../lib/studentProfile.js'
import { rankJobs, WEIGHTS } from '../lib/nlpMatcher.js'

const skillName = (skill) => String(typeof skill === 'string' ? skill : skill?.name || '').trim()

// Collect everything the NLP matcher can learn about a student:
// skills (latest CV + account + profile summary), department, target roles and free text.
async function studentForEmail(email) {
  const user = await User.findOne({ email })
  if (!user) return { skills: [], department: '', targetRoles: '', profileText: '' }

  const latest = await Resume.findOne({ user: user._id }).sort({ updatedAt: -1 })
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
  const email = req.query.email?.toLowerCase().trim()
  if (!email) res.status(400).json({ message: 'email is required' })
  return email
}

export const matchJobs = async (req, res) => {
  try {
    const email = requireEmail(req, res)
    if (!email) return undefined

    const student = await studentForEmail(email)
    const jobs = await JobVacancy.find().sort({ postedDate: -1 }).lean()

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

    const job = await JobVacancy.findById(req.params.id).lean()
    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }

    // IDF is still computed over every vacancy so scores agree with the list view.
    const student = await studentForEmail(email)
    const jobs = await JobVacancy.find().lean()
    const result = rankJobs(student, jobs).find((r) => String(r.job._id) === String(job._id))

    return res.json({ skills: student.skills, ...result })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
