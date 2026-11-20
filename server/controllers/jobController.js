import { getSupabase } from '../config/db.js'
import { isUuid, jobFromRow, jobToRow, unwrap } from '../lib/mappers.js'

export const parseSkills = (value) => {
  const source = Array.isArray(value) ? value : String(value || '').split(/[,|\n]/)
  return [...new Set(source.map((skill) => String(skill).trim()).filter(Boolean))]
}

// Returns an ISO string, or null when the value is not a valid date.
const parseDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const notFound = (res) => res.status(404).json({ message: 'Job vacancy not found' })

export async function listJobs() {
  const rows = unwrap(await getSupabase()
    .from('job_vacancies')
    .select('*')
    .order('posted_date', { ascending: false }))
  return rows.map(jobFromRow)
}

export async function findJob(id) {
  if (!isUuid(id)) return null
  const row = unwrap(await getSupabase().from('job_vacancies').select('*').eq('id', id).maybeSingle())
  return jobFromRow(row)
}

export const getJobs = async (req, res) => {
  try {
    return res.json(await listJobs())
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getJob = async (req, res) => {
  try {
    const job = await findJob(req.params.id)
    return job ? res.json(job) : notFound(res)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const createJob = async (req, res) => {
  try {
    const { jobTitle, company, description, postedDate } = req.body
    if (!jobTitle?.trim() || !company?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Job title, company, and description are required' })
    }
    const posted = postedDate ? parseDate(postedDate) : new Date().toISOString()
    if (!posted) {
      return res.status(400).json({ message: 'Posted date is not a valid date' })
    }

    const row = unwrap(await getSupabase()
      .from('job_vacancies')
      .insert(jobToRow({
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        description: description.trim(),
        requiredSkills: parseSkills(req.body.requiredSkills),
        postedDate: posted,
        postedBy: req.user?.id ?? null,
      }))
      .select('*')
      .single())

    return res.status(201).json(jobFromRow(row))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateJob = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res)

    const { jobTitle, company, description, postedDate } = req.body
    const changes = {}
    if (jobTitle !== undefined) changes.jobTitle = String(jobTitle).trim()
    if (company !== undefined) changes.company = String(company).trim()
    if (description !== undefined) changes.description = String(description).trim()
    if (req.body.requiredSkills !== undefined) changes.requiredSkills = parseSkills(req.body.requiredSkills)
    if (postedDate) {
      changes.postedDate = parseDate(postedDate)
      if (!changes.postedDate) return res.status(400).json({ message: 'Posted date is not a valid date' })
    }
    if (['jobTitle', 'company', 'description'].some((key) => changes[key] === '')) {
      return res.status(400).json({ message: 'Job title, company, and description cannot be empty' })
    }
    if (!Object.keys(changes).length) {
      const job = await findJob(req.params.id)
      return job ? res.json(job) : notFound(res)
    }

    const row = unwrap(await getSupabase()
      .from('job_vacancies')
      .update(jobToRow(changes))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle())
    return row ? res.json(jobFromRow(row)) : notFound(res)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const deleteJob = async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return notFound(res)
    const rows = unwrap(await getSupabase()
      .from('job_vacancies')
      .delete()
      .eq('id', req.params.id)
      .select('id'))
    return rows.length ? res.json({ message: 'Job vacancy deleted' }) : notFound(res)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
