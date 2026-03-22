import { Router } from 'express'
import {
  getAllHours,
  getHourById,
  createHourEntry,
  updateHourStatus,
  deleteHourEntry,
  getTeacherSummary,
  getTeacherSubjects,
  getHourTypes
} from '../controllers/hours.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)

// ⚠️ Routes fixes AVANT les routes avec :id
router.get('/teacher-subjects', getTeacherSubjects)
router.get('/hour-types', getHourTypes)
router.get('/summary/:teacherId', getTeacherSummary)

router.get('/', getAllHours)
router.get('/:id', getHourById)
router.post('/', requireRole('ADMIN', 'RH'), createHourEntry)
router.patch('/:id/status', requireRole('ADMIN', 'RH'), updateHourStatus)
router.delete('/:id', requireRole('ADMIN', 'RH'), deleteHourEntry)

export default router