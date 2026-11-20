import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { ensureAdmin } from './controllers/authController.js'
import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import profileRoutes from './routes/profileRoutes.js'

// Local runs read server/.env. On Vercel the dashboard env vars are already set,
// and dotenv will not overwrite them.
const dir = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(dir, '.env') })

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: 'supabase' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/match', matchRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

let pending
// One connection check per process. A failed attempt can be retried.
export function ready() {
  if (!pending) {
    pending = connectDB()
      .then(() => ensureAdmin())
      .catch((error) => {
        pending = null
        throw error
      })
  }
  return pending
}

export default app
