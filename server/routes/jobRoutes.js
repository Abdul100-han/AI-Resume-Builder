import { Router } from 'express'
import { adminOnly, protect } from '../middleware/auth.js'
import { createJob, deleteJob, getJob, getJobs, updateJob } from '../controllers/jobController.js'

const router = Router()

router.get('/', getJobs)
router.get('/:id', getJob)
router.post('/', protect, adminOnly, createJob)
router.put('/:id', protect, adminOnly, updateJob)
router.delete('/:id', protect, adminOnly, deleteJob)

export default router
