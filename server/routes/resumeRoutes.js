import { Router } from 'express'
import {
  createResume,
  deleteResume,
  getResumeById,
  getResumes,
  syncResume,
  updateResume,
} from '../controllers/resumeController.js'

const router = Router()

router.get('/', getResumes)
router.post('/', createResume)
router.put('/sync', syncResume)
router.get('/:id', getResumeById)
router.put('/:id', updateResume)
router.delete('/:id', deleteResume)

export default router
