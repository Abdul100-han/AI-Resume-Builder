import User from '../models/User.js'
import {
  normalizeStudentProfile,
  publicStudent,
  skillsFromSummary,
  splitName,
  validateStudentProfile,
} from '../lib/studentProfile.js'

const ownerEmail = (value) => String(value || '').toLowerCase().trim()

export const getProfile = async (req, res) => {
  try {
    const email = ownerEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await User.findOne({ email }).select('-password')
    return res.json(publicStudent(user, email))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const saveProfile = async (req, res) => {
  try {
    const email = ownerEmail(req.body.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const studentProfile = normalizeStudentProfile(req.body)
    const message = validateStudentProfile(studentProfile)
    if (message) {
      return res.status(400).json({ message })
    }

    let user = await User.findOne({ email })
    if (user?.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts do not use the student profile' })
    }

    if (!user) {
      user = new User({
        name: studentProfile.fullName,
        email,
        role: 'student',
      })
    }

    const { firstName, lastName } = splitName(studentProfile.fullName)
    const currentInfo = user.personalInfo?.toObject?.() || { ...(user.personalInfo || {}) }
    const primaryRole = studentProfile.targetRoles.split(',')[0].trim()

    user.name = studentProfile.fullName
    user.studentProfile = studentProfile
    user.personalInfo = {
      ...currentInfo,
      firstName,
      lastName,
      jobTitle: primaryRole || currentInfo.jobTitle || '',
    }

    const parsedSkills = skillsFromSummary(studentProfile.skillsSummary)
    if (parsedSkills.length && !(user.skills || []).length) {
      user.skills = parsedSkills
    }

    await user.save()
    return res.json(publicStudent(user, email))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
