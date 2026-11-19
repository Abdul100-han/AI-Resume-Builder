export const INSTITUTION = 'Kano State Polytechnic'

export const ACADEMIC_STATUSES = ['Final-Year Student', 'Recent Graduate']

export function normalizeStudentProfile(body = {}) {
  const academicStatus = ACADEMIC_STATUSES.includes(body.academicStatus) ? body.academicStatus : ''

  return {
    fullName: String(body.fullName || '').trim(),
    contactEmail: String(body.contactEmail || '').trim().toLowerCase(),
    institution: String(body.institution || INSTITUTION).trim() || INSTITUTION,
    department: String(body.department || '').trim(),
    academicStatus,
    graduationYear: String(body.graduationYear || '').trim(),
    targetRoles: String(body.targetRoles || '').trim(),
    skillsSummary: String(body.skillsSummary || '').trim(),
  }
}

export function validateStudentProfile(profile) {
  if (!profile.fullName) return 'Full name is required'
  if (!profile.contactEmail.includes('@')) return 'A contact email is required'
  if (!profile.department) return 'Department or program is required'
  if (!profile.academicStatus) return 'Academic status is required'
  if (!/^\d{4}$/.test(profile.graduationYear)) return 'Enter a 4-digit graduation year'
  return ''
}

export function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

export function skillsFromSummary(text) {
  return [...new Set(String(text || '').split(/[,|\n]/).map((skill) => skill.trim()).filter(Boolean))]
    .map((name) => ({ name, rating: 0 }))
}

export function publicStudent(user, ownerEmail) {
  const profile = user?.studentProfile || {}
  return {
    id: user?._id,
    email: user?.email || ownerEmail,
    name: user?.name || 'Guest',
    role: user?.role || 'student',
    studentProfile: {
      fullName: profile.fullName || (user?.name && user.name !== 'Guest' ? user.name : ''),
      contactEmail: profile.contactEmail || '',
      institution: profile.institution || INSTITUTION,
      department: profile.department || '',
      academicStatus: profile.academicStatus || '',
      graduationYear: profile.graduationYear || '',
      targetRoles: profile.targetRoles || '',
      skillsSummary: profile.skillsSummary || '',
    },
  }
}

export function profileSeed(user) {
  const profile = user?.studentProfile || {}
  const fullName = String(profile.fullName || '').trim()
  if (!fullName || fullName === 'Guest' || !profile.department) return null

  const { firstName, lastName } = splitName(fullName)
  const institution = profile.institution || INSTITUTION
  const year = profile.graduationYear || ''
  const status = profile.academicStatus || 'student'
  const interests = profile.targetRoles ? ` Target roles: ${profile.targetRoles}.` : ''
  const skills = profile.skillsSummary ? ` Core skills: ${profile.skillsSummary}.` : ''

  return {
    firstName,
    lastName,
    email: profile.contactEmail || '',
    jobTitle: String(profile.targetRoles || '').split(',')[0].trim(),
    address: 'Kano, Nigeria',
    summery: `${fullName} is a ${status.toLowerCase()} in ${profile.department} at ${institution}${year ? `, ${year}` : ''}.${interests}${skills}`,
    education: [{
      universityName: institution,
      degree: profile.academicStatus || '',
      major: profile.department,
      startDate: '',
      endDate: year,
      description: profile.targetRoles ? `Career interests: ${profile.targetRoles}` : '',
    }],
    skills: skillsFromSummary(profile.skillsSummary),
  }
}
