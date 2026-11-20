export function normalizeResume(resume = {}) {
  const source = resume || {}
  const { Experience, ...rest } = source
  const experience = rest.experience ?? Experience ?? []

  return {
    ...rest,
    experience: Array.isArray(experience) ? experience : [],
    education: Array.isArray(rest.education) ? rest.education : [],
    skills: Array.isArray(rest.skills) ? rest.skills : [],
    summery: rest.summery ?? rest.summary ?? '',
    template: rest.template || 'classic',
  }
}
