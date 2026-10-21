import { Router } from 'express'
import { matchJobs, matchOneJob } from '../controllers/matchController.js'

const router = Router()

router.get('/', matchJobs)
router.get('/:id', matchOneJob)

export default router
