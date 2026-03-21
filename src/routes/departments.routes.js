import { Router } from 'express'
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departments.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', getAllDepartments)
router.post('/', requireRole('ADMIN'), createDepartment)
router.put('/:id', requireRole('ADMIN'), updateDepartment)
router.delete('/:id', requireRole('ADMIN'), deleteDepartment)

export default router