const STORAGE_KEY = 'resume-builder-user'

export function getLocalUser() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) {
    try {
      return JSON.parse(existing)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const user = {
    email: `guest-${crypto.randomUUID()}@local`,
    name: 'Guest',
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

// Demo helper: act as a seeded student (see server/seed.js). Students have no password,
// so the browser's stored email is their identity.
export function switchLocalUser(email, name) {
  const next = { email: String(email).toLowerCase().trim(), name: name || 'Guest' }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function resetLocalUser() {
  localStorage.removeItem(STORAGE_KEY)
  return getLocalUser()
}

export function saveLocalUser(updates) {
  const current = getLocalUser()
  const next = {
    ...current,
    ...updates,
    email: current.email,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
