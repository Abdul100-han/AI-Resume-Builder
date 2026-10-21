import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { ensureAdmin } from './controllers/authController.js'
import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import matchRoutes from './routes/matchRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
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
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
