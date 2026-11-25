const asList = (value) => (Array.isArray(value) ? value : [])
const plain = (value) => String(value || '').replace(/<[^>]*>/g, '').trim()

export const filledEducation = (list) =>
  asList(list).filter((item) =>
    [item?.universityName, item?.degree, item?.major, item?.description].some((v) => String(v || '').trim())
  )

export const filledExperience = (list) =>
  asList(list).filter((item) =>
    [item?.title, item?.companyName, plain(item?.workSummery)].some(Boolean)
  )

export const filledSkills = (list) =>
  asList(list).filter((item) => String(item?.name || '').trim())

export const filledCertifications = (list) =>
  asList(list).filter((item) =>
    [item?.name, item?.issuer, item?.credentialId].some((v) => String(v || '').trim())
  )

export const filledProjects = (list) =>
  asList(list).filter((item) =>
    [item?.name, item?.role, item?.url, plain(item?.description)].some(Boolean)
  )

export function normalizeResume(resume = {}) {
  const source = resume || {}
  const { Experience, ...rest } = source
  const experience = rest.experience ?? Experience ?? []

  return {
    ...rest,
    experience: asList(experience),
    education: asList(rest.education),
    skills: asList(rest.skills),
    certifications: asList(rest.certifications),
    projects: asList(rest.projects),
    summery: rest.summery ?? rest.summary ?? '',
    template: rest.template || 'classic',
  }
}
