import { randomUUID } from 'crypto'
import mongoose from 'mongoose'
import Resume from '../models/Resume.js'
import User from '../models/User.js'
import { profileSeed } from '../lib/studentProfile.js'

const cleanSkills = (skills = []) =>
  (Array.isArray(skills) ? skills : [])
    .map((skill) => {
      const name = typeof skill === 'string' ? skill : skill?.name
      return {
        name: String(name || '').trim(),
        rating: Number(skill?.rating) || 0,
      }
    })
    .filter((skill) => skill.name)

const cleanEducation = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    universityName: item?.universityName || '',
    degree: item?.degree || '',
    major: item?.major || '',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    description: item?.description || '',
  }))

const cleanExperience = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    title: item?.title || '',
    companyName: item?.companyName || '',
    city: item?.city || '',
    state: item?.state || '',
    startDate: item?.startDate || '',
    endDate: item?.currentlyWorking ? '' : item?.endDate || '',
    currentlyWorking: Boolean(item?.currentlyWorking),
    workSummery: item?.workSummery || '',
  }))

const TEMPLATES = ['classic', 'modern']
const cleanTemplate = (value) => (TEMPLATES.includes(value) ? value : 'classic')

const ownerEmail = (value) => String(value || '').toLowerCase().trim()

const findOrCreateStudent = async (email, name) => {
  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({
      name: name || 'Guest',
      email,
      role: 'student',
    })
  }
  return user
}

const mirrorStudent = async (user, resume, body) => {
  if (!user || user.role !== 'student') return

  let changed = false
  if (body.skills !== undefined) {
    user.skills = resume.skills
    changed = true
  }
  if (body.education !== undefined) {
    user.education = resume.education
    changed = true
  }
  if (body.experience !== undefined || body.Experience !== undefined) {
    user.experience = resume.experience
    changed = true
  }

  const personalKeys = ['firstName', 'lastName', 'phone', 'address', 'jobTitle']
  if (personalKeys.some((key) => body[key] !== undefined)) {
    user.personalInfo = {
      firstName: resume.firstName,
      lastName: resume.lastName,
      phone: resume.phone,
      address: resume.address,
      jobTitle: resume.jobTitle,
    }
    const fullName = [resume.firstName, resume.lastName].filter(Boolean).join(' ').trim()
    const profile = { ...(user.studentProfile?.toObject?.() || user.studentProfile || {}) }
    if (fullName) {
      user.name = fullName
      profile.fullName = fullName
    }
    user.studentProfile = profile
    changed = true
  }

  if (body.email !== undefined && resume.email) {
    const profile = { ...(user.studentProfile?.toObject?.() || user.studentProfile || {}) }
    profile.contactEmail = resume.email
    user.studentProfile = profile
    changed = true
  }

  if (changed) await user.save()
}

export const createResume = async (req, res) => {
  try {
    const email = ownerEmail(req.body.email)
    const title = String(req.body.title || '').trim()
    if (!email || !title) {
      return res.status(400).json({ message: 'email and title are required' })
    }

    const user = await findOrCreateStudent(email, req.body.name)
    const seed = profileSeed(user)
    const resume = await Resume.create({
      user: user._id,
      title,
      resumeId: randomUUID(),
      themeColor: '#0f6b5e',
      template: cleanTemplate(req.body.template),
      firstName: seed?.firstName,
      lastName: seed?.lastName,
      jobTitle: seed?.jobTitle,
      address: seed?.address,
      email: seed?.email,
      summery: seed?.summery,
      experience: [],
      education: seed?.education || [],
      skills: seed?.skills || [],
    })

    return res.status(201).json(resume)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getResumes = async (req, res) => {
  try {
    const email = ownerEmail(req.query.email)
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

export const getResumeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const resume = await Resume.findById(req.params.id)
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    return res.json(resume)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateResume = async (req, res) => {
  try {
    const email = ownerEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const user = await User.findOne({ email })
    const resume = user
      ? await Resume.findOne({ _id: req.params.id, user: user._id })
      : null
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const scalarFields = ['title', 'themeColor', 'firstName', 'lastName', 'jobTitle', 'address', 'phone', 'email']
    for (const field of scalarFields) {
      if (req.body[field] !== undefined) resume[field] = req.body[field]
    }
    if (req.body.template !== undefined) resume.template = cleanTemplate(req.body.template)
    if (req.body.summery !== undefined) resume.summery = req.body.summery
    else if (req.body.summary !== undefined) resume.summery = req.body.summary

    if (req.body.experience !== undefined || req.body.Experience !== undefined) {
      resume.experience = cleanExperience(req.body.experience ?? req.body.Experience)
    }
    if (req.body.education !== undefined) {
      resume.education = cleanEducation(req.body.education)
    }
    if (req.body.skills !== undefined) {
      resume.skills = cleanSkills(req.body.skills)
    }

    await resume.save()
    await mirrorStudent(user, resume, req.body)
    return res.json(resume)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const deleteResume = async (req, res) => {
  try {
    const email = ownerEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const user = await User.findOne({ email })
    const resume = user
      ? await Resume.findOneAndDelete({ _id: req.params.id, user: user._id })
      : null
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    return res.json({ message: 'Resume deleted' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const syncResume = async (req, res) => {
  try {
    const email = ownerEmail(req.body.email)
    const resumeId = req.body.resumeId?.trim()
    if (!email || !resumeId) {
      return res.status(400).json({ message: 'email and resumeId are required' })
    }

    const skills = cleanSkills(req.body.skills)
    const education = cleanEducation(req.body.education)
    const experience = cleanExperience(req.body.experience ?? req.body.Experience)

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
        ...(req.body.template !== undefined && { template: cleanTemplate(req.body.template) }),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        jobTitle: req.body.jobTitle,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.contactEmail,
        summery: req.body.summery ?? req.body.summary,
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
