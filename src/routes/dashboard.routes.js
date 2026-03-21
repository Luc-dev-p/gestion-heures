import { Router } from 'express'
import {
  getOverview,
  getHoursByDepartment,
  getOverloadedTeachers,
  getMonthlyStats
} from '../controllers/dashboard.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)
router.use(requireRole('ADMIN', 'RH'))

router.get('/overview', getOverview)
router.get('/by-department', getHoursByDepartment)
router.get('/overload', getOverloadedTeachers)
router.get('/monthly', getMonthlyStats)

export default router
