import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { ensureAdmin } from './controllers/authController.js'
import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import profileRoutes from './routes/profileRoutes.js'

dotenv.config()

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

const port = process.env.PORT || 5000

connectDB()
  .then(() => ensureAdmin())
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use by another program. Stop it, or set PORT in server/.env `
          + '(and point VITE_API_BASE_URL / the Vite proxy at the new port).')
      } else {
        console.error(error.message)
      }
      process.exit(1)
    })
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
