import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getSupabase } from '../config/db.js'

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

// Create the admin from server/.env on first start. If that email already exists, nothing changes.
export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is missing. No admin user was created.')
    return
  }

  const supabase = getSupabase()
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (findError) throw new Error(`Could not check admin user: ${findError.message}`)
  if (existing) return

  const hashed = await bcrypt.hash(password, 10)
  const { error: insertError } = await supabase.from('users').insert({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: hashed,
    role: 'admin',
  })
  // 23505 = unique violation: another process created the admin at the same moment.
  if (insertError && insertError.code !== '23505') {
    throw new Error(`Could not create admin user: ${insertError.message}`)
  }
  console.log(`Admin user created for ${email}`)
}

export const login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim()
    const password = req.body.password || ''
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' })
    }

    const { data: user, error } = await getSupabase()
      .from('users')
      .select('id, name, email, role, password')
      .eq('email', email)
      .maybeSingle()
    if (error) throw error
    if (!user?.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const matches = await bcrypt.compare(password, user.password)
    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    return res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
