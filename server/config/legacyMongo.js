import mongoose from 'mongoose'

// TEMPORARY (Phase 1 → Phase 2 migration).
// Auth and admin users already use Supabase. Jobs, resumes, profiles, matching and the
// seed script still use Mongoose models until Phase 2 moves them. If MONGO_URI is set,
// connect so those routes keep working in the meantime; delete this file in Phase 2.
export async function connectLegacyMongo() {
  const uri = process.env.MONGO_URI?.trim()
  if (!uri) {
    console.warn('MONGO_URI not set: job, resume, profile and match routes are unavailable until Phase 2.')
    return false
  }
  await mongoose.connect(uri)
  console.log('Legacy MongoDB connected (pending Phase 2 migration)')
  return true
}
