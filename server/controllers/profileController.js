import {
  normalizeStudentProfile,
  publicStudent,
  skillsFromSummary,
  splitName,
  validateStudentProfile,
} from '../lib/studentProfile.js'
import { findUserByEmail, insertUser, normalizeEmail, updateUser } from '../lib/userStore.js'

// publicStudent() reads the id from `_id`; pass the Supabase uuid through explicitly.
const respond = (user, email) => ({ ...publicStudent(user, email), id: user?.id })

export const getProfile = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await findUserByEmail(email)
    return res.json(respond(user, email))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const saveProfile = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const studentProfile = normalizeStudentProfile(req.body)
    const message = validateStudentProfile(studentProfile)
    if (message) {
      return res.status(400).json({ message })
    }

    const user = await findUserByEmail(email)
    if (user?.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts do not use the student profile' })
    }

    const { firstName, lastName } = splitName(studentProfile.fullName)
    const currentInfo = user?.personalInfo || {}
    const primaryRole = studentProfile.targetRoles.split(',')[0].trim()

    const changes = {
      name: studentProfile.fullName,
      studentProfile,
      personalInfo: {
        ...currentInfo,
        firstName,
        lastName,
        jobTitle: primaryRole || currentInfo.jobTitle || '',
      },
    }

    // Seed the skills list from the profile summary only if the student has none yet.
    const parsedSkills = skillsFromSummary(studentProfile.skillsSummary)
    if (parsedSkills.length && !(user?.skills || []).length) {
      changes.skills = parsedSkills
    }

    const saved = user
      ? await updateUser(user.id, changes)
      : await insertUser({ ...changes, email, role: 'student' })
    return res.json(respond(saved, email))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
