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
