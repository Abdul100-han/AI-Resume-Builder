import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is missing. No admin user was created.')
    return
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: hashed,
    role: 'admin',
  })
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

    const user = await User.findOne({ email })
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
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
