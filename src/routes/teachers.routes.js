import { Router } from 'express'
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../controllers/teachers.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate) // toutes les routes teachers nécessitent un token

router.get('/', getAllTeachers)
router.get('/:id', getTeacherById)
router.post('/', requireRole('ADMIN', 'RH'), createTeacher)
router.put('/:id', requireRole('ADMIN', 'RH'), updateTeacher)
router.delete('/:id', requireRole('ADMIN'), deleteTeacher)

export default router