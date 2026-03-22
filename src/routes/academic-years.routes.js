import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import prisma from '../lib/prisma.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const years = await prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } })
    return res.status(200).json(years)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

router.post('/', requireRole('ADMIN'), async (req, res) => {
  const { label, startDate, endDate, is_active } = req.body
  try {
    const year = await prisma.academicYear.create({
      data: { label, startDate: new Date(startDate), endDate: new Date(endDate), is_active }
    })
    return res.status(201).json({ message: 'Année créée', year })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Libellé déjà existant' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

router.patch('/:id/activate', requireRole('ADMIN'), async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.academicYear.updateMany({ data: { is_active: false } })
    const year = await prisma.academicYear.update({ where: { id }, data: { is_active: true } })
    return res.status(200).json({ message: 'Année activée', year })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.academicYear.delete({ where: { id } })
    return res.status(200).json({ message: 'Année supprimée' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Année introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
})

export default router