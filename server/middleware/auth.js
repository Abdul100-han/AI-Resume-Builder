import jwt from 'jsonwebtoken'
import { getSupabase } from '../config/db.js'

export async function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Tokens issued before the Supabase move hold a Mongo id, which is not a uuid:
    // the query errors and the user is asked to log in again.
    const { data: user, error } = await getSupabase()
      .from('users')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .maybeSingle()
    if (error || !user) {
      return res.status(401).json({ message: 'Not authorized' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
