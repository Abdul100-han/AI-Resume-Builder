// User lookups shared by the profile, resume and match controllers.
import { getSupabase } from '../config/db.js'
import { USER_PUBLIC_FIELDS, unwrap, userFromRow, userToRow } from './mappers.js'

export const normalizeEmail = (value) => String(value || '').toLowerCase().trim()

export async function findUserByEmail(email) {
  const row = unwrap(await getSupabase()
    .from('users')
    .select(USER_PUBLIC_FIELDS)
    .eq('email', normalizeEmail(email))
    .maybeSingle())
  return userFromRow(row)
}

export async function insertUser(user) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .insert(userToRow({ ...user, email: normalizeEmail(user.email) }))
    .select(USER_PUBLIC_FIELDS)
    .single()
  // 23505 = unique violation: a parallel request created the same email first.
  if (error?.code === '23505') return findUserByEmail(user.email)
  if (error) throw new Error(error.message)
  return userFromRow(data)
}

export async function updateUser(id, changes) {
  const row = unwrap(await getSupabase()
    .from('users')
    .update(userToRow(changes))
    .eq('id', id)
    .select(USER_PUBLIC_FIELDS)
    .single())
  return userFromRow(row)
}

// Students have no password: the first request that uses an email creates the account.
export async function findOrCreateStudent(email, name) {
  const existing = await findUserByEmail(email)
  if (existing) return existing
  return insertUser({ name: name || 'Guest', email, role: 'student' })
}
