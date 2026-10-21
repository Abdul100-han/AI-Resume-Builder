import JobVacancy from '../models/JobVacancy.js'
import User from '../models/User.js'

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const tokensMatch = (left, right) => {
  if (!left || !right) return false
  if (left === right) return true
  return left.includes(right) || right.includes(left)
}

export function calculateMatchScore(userSkills = [], requiredSkills = []) {
  const normalizedUser = userSkills
    .map((skill) => normalize(typeof skill === 'string' ? skill : skill?.name))
    .filter(Boolean)

  const required = requiredSkills.map((skill) => String(skill).trim()).filter(Boolean)
  const matchedSkills = []
  const missingSkills = []

  for (const skill of required) {
    const key = normalize(skill)
    const found = normalizedUser.some((userSkill) => tokensMatch(userSkill, key))
    if (found) matchedSkills.push(skill)
    else missingSkills.push(skill)
  }

  const score = required.length
    ? Math.round((matchedSkills.length / required.length) * 100)
    : 0

  return { score, matchedSkills, missingSkills }
}

export const matchJobs = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase().trim()
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await User.findOne({ email })
    const skills = user?.skills || []
    const jobs = await JobVacancy.find().sort({ postedDate: -1 })

    const results = jobs.map((job) => {
      const match = calculateMatchScore(skills, job.requiredSkills)
      return {
        job,
        ...match,
      }
    })

    results.sort((a, b) => b.score - a.score)

    return res.json({
      skills: skills.map((skill) => skill.name).filter(Boolean),
      results,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const matchOneJob = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase().trim()
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const job = await JobVacancy.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }

    const user = await User.findOne({ email })
    const match = calculateMatchScore(user?.skills || [], job.requiredSkills)
    return res.json({ job, skills: (user?.skills || []).map((skill) => skill.name), ...match })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
