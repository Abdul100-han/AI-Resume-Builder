import JobVacancy from '../models/JobVacancy.js'

export const parseSkills = (value) => {
  const source = Array.isArray(value) ? value : String(value || '').split(/[,|\n]/)
  return [...new Set(source.map((skill) => String(skill).trim()).filter(Boolean))]
}

export const getJobs = async (req, res) => {
  try {
    const jobs = await JobVacancy.find().sort({ postedDate: -1 })
    return res.json(jobs)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const getJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }
    return res.json(job)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const createJob = async (req, res) => {
  try {
    const { jobTitle, company, description, postedDate } = req.body
    const requiredSkills = parseSkills(req.body.requiredSkills)

    if (!jobTitle?.trim() || !company?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Job title, company, and description are required' })
    }

    const job = await JobVacancy.create({
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      description: description.trim(),
      requiredSkills,
      postedDate: postedDate ? new Date(postedDate) : new Date(),
      postedBy: req.user?._id,
    })

    return res.status(201).json(job)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }

    const { jobTitle, company, description, postedDate } = req.body
    if (jobTitle !== undefined) job.jobTitle = jobTitle.trim()
    if (company !== undefined) job.company = company.trim()
    if (description !== undefined) job.description = description.trim()
    if (req.body.requiredSkills !== undefined) {
      job.requiredSkills = parseSkills(req.body.requiredSkills)
    }
    if (postedDate) job.postedDate = new Date(postedDate)

    await job.save()
    return res.json(job)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const deleteJob = async (req, res) => {
  try {
    const job = await JobVacancy.findByIdAndDelete(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' })
    }
    return res.json({ message: 'Job vacancy deleted' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
