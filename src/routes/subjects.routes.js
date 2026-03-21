import { Router } from 'express'
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjects.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllSubjects)
router.get('/:id', getSubjectById)
router.post('/', requireRole('ADMIN', 'RH'), createSubject)
router.put('/:id', requireRole('ADMIN', 'RH'), updateSubject)
router.delete('/:id', requireRole('ADMIN'), deleteSubject)

export default router