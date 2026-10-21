import { Router } from 'express'
import { getResumes, syncResume } from '../controllers/resumeController.js'

const router = Router()

router.get('/', getResumes)
router.put('/sync', syncResume)

export default router
