import { randomUUID } from 'crypto'
import { getSupabase } from '../config/db.js'
import { profileSeed } from '../lib/studentProfile.js'
import { isUuid, resumeFromRow, resumeToRow, unwrap } from '../lib/mappers.js'
import { findOrCreateStudent, findUserByEmail, normalizeEmail, updateUser } from '../lib/userStore.js'

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

const notFound = (res) => res.status(404).json({ message: 'Resume not found' })

const resumes = () => getSupabase().from('resumes')

// A resume the given student owns, or null.
async function findOwnedResume(id, user) {
  if (!user || !isUuid(id)) return null
  const row = unwrap(await resumes().select('*').eq('id', id).eq('user_id', user.id).maybeSingle())
  return resumeFromRow(row)
}

// Keep the student's account in step with their latest CV edits, so job matching
// and new CVs see the same skills, education and experience.
async function mirrorStudent(user, resume, body) {
  if (!user || user.role !== 'student') return

  const changes = {}
  if (body.skills !== undefined) changes.skills = resume.skills
  if (body.education !== undefined) changes.education = resume.education
  if (body.experience !== undefined || body.Experience !== undefined) changes.experience = resume.experience

  const personalKeys = ['firstName', 'lastName', 'phone', 'address', 'jobTitle']
  let profile = null
  if (personalKeys.some((key) => body[key] !== undefined)) {
    changes.personalInfo = {
      firstName: resume.firstName,
      lastName: resume.lastName,
      phone: resume.phone,
      address: resume.address,
      jobTitle: resume.jobTitle,
    }
    const fullName = [resume.firstName, resume.lastName].filter(Boolean).join(' ').trim()
    if (fullName) {
      changes.name = fullName
      profile = { ...(user.studentProfile || {}), fullName }
    }
  }
  if (body.email !== undefined && resume.email) {
    profile = { ...(profile || user.studentProfile || {}), contactEmail: resume.email }
  }
  if (profile) changes.studentProfile = profile

  if (Object.keys(changes).length) await updateUser(user.id, changes)
}

export const createResume = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const title = String(req.body.title || '').trim()
    if (!email || !title) {
      return res.status(400).json({ message: 'email and title are required' })
    }

    const user = await findOrCreateStudent(email, req.body.name)
    // Pre-fill the new CV from the student profile (name, department, skills, …).
    const seed = profileSeed(user)
    const row = unwrap(await resumes()
      .insert(resumeToRow({
        userId: user.id,
        resumeId: randomUUID(),
        title,
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
      }))
      .select('*')
      .single())

    return res.status(201).json(resumeFromRow(row))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getResumes = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await findUserByEmail(email)
    if (!user) return res.json([])

    const rows = unwrap(await resumes().select('*').eq('user_id', user.id).order('updated_at', { ascending: false }))
    return res.json(rows.map(resumeFromRow))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Public: anyone with the link can view a CV.
export const getResumeById = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res)
    const row = unwrap(await resumes().select('*').eq('id', req.params.id).maybeSingle())
    return row ? res.json(resumeFromRow(row)) : notFound(res)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateResume = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await findUserByEmail(email)
    const resume = await findOwnedResume(req.params.id, user)
    if (!resume) return notFound(res)

    const changes = {}
    for (const field of ['title', 'themeColor', 'firstName', 'lastName', 'jobTitle', 'address', 'phone', 'email']) {
      if (req.body[field] !== undefined) changes[field] = req.body[field]
    }
    if (req.body.template !== undefined) changes.template = cleanTemplate(req.body.template)
    if (req.body.summery !== undefined) changes.summery = req.body.summery
    else if (req.body.summary !== undefined) changes.summery = req.body.summary
    if (req.body.experience !== undefined || req.body.Experience !== undefined) {
      changes.experience = cleanExperience(req.body.experience ?? req.body.Experience)
    }
    if (req.body.education !== undefined) changes.education = cleanEducation(req.body.education)
    if (req.body.skills !== undefined) changes.skills = cleanSkills(req.body.skills)

    if (!Object.keys(changes).length) return res.json(resume)

    const row = unwrap(await resumes()
      .update(resumeToRow(changes))
      .eq('id', resume.id)
      .select('*')
      .single())
    const saved = resumeFromRow(row)

    await mirrorStudent(user, saved, req.body)
    return res.json(saved)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const deleteResume = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email)
    if (!email) {
      return res.status(400).json({ message: 'email is required' })
    }

    const user = await findUserByEmail(email)
    if (!user || !isUuid(req.params.id)) return notFound(res)

    const rows = unwrap(await resumes().delete().eq('id', req.params.id).eq('user_id', user.id).select('id'))
    return rows.length ? res.json({ message: 'Resume deleted' }) : notFound(res)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Create-or-replace a CV by its client-side resumeId, and copy its details onto the student.
export const syncResume = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const resumeId = req.body.resumeId?.trim()
    if (!email || !resumeId) {
      return res.status(400).json({ message: 'email and resumeId are required' })
    }

    const skills = cleanSkills(req.body.skills)
    const education = cleanEducation(req.body.education)
    const experience = cleanExperience(req.body.experience ?? req.body.Experience)
    const personalInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      jobTitle: req.body.jobTitle,
    }

    let user = await findOrCreateStudent(email, req.body.name)
    if (user.role === 'student') {
      user = await updateUser(user.id, {
        name: req.body.name || user.name,
        skills,
        education,
        experience,
        personalInfo,
      })
    }

    const row = unwrap(await resumes()
      .upsert(resumeToRow({
        userId: user.id,
        resumeId,
        title: req.body.title || 'Untitled Resume',
        themeColor: req.body.themeColor,
        ...(req.body.template !== undefined && { template: cleanTemplate(req.body.template) }),
        ...personalInfo,
        email: req.body.contactEmail,
        summery: req.body.summery ?? req.body.summary,
        experience,
        education,
        skills,
      }), { onConflict: 'user_id,resume_id' })
      .select('*')
      .single())

    return res.json(resumeFromRow(row))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
