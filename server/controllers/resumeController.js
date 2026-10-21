import Resume from '../models/Resume.js'
import User from '../models/User.js'

const cleanSkills = (skills = []) =>
  skills
    .map((skill) => ({
      name: String(skill?.name || skill || '').trim(),
      rating: Number(skill?.rating) || 0,
    }))
    .filter((skill) => skill.name)

const cleanList = (items) => (Array.isArray(items) ? items : [])

export const syncResume = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim()
    const resumeId = req.body.resumeId?.trim()
    if (!email || !resumeId) {
      return res.status(400).json({ message: 'email and resumeId are required' })
    }

    const skills = cleanSkills(req.body.skills)
    const education = cleanList(req.body.education)
    const experience = cleanList(req.body.experience || req.body.Experience)

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        name: req.body.name || 'Guest',
        email,
        role: 'student',
        skills,
        education,
        experience,
        personalInfo: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phone: req.body.phone,
          address: req.body.address,
          jobTitle: req.body.jobTitle,
        },
      })
    } else if (user.role === 'student') {
      user.name = req.body.name || user.name
      user.skills = skills
      user.education = education
      user.experience = experience
      user.personalInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        address: req.body.address,
        jobTitle: req.body.jobTitle,
      }
      await user.save()
    }

    const resume = await Resume.findOneAndUpdate(
      { user: user._id, resumeId },
      {
        user: user._id,
        resumeId,
        title: req.body.title || 'Untitled Resume',
        themeColor: req.body.themeColor,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        jobTitle: req.body.jobTitle,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.contactEmail,
        summery: req.body.summery,
        experience,
        education,
        skills,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.json(resume)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getResumes = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase().trim()
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json([])
    }

    const resumes = await Resume.find({ user: user._id }).sort({ updatedAt: -1 })
    return res.json(resumes)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
