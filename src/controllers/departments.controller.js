import prisma from '../lib/prisma.js'

// GET /api/departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { teachers: true, subjects: true } } }
    })
    return res.status(200).json(departments)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// POST /api/departments
export const createDepartment = async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ message: 'Nom requis' })

  try {
    const department = await prisma.department.create({ data: { name } })
    return res.status(201).json({ message: 'Département créé', department })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Département déjà existant' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// PUT /api/departments/:id
export const updateDepartment = async (req, res) => {
  const id = parseInt(req.params.id)
  const { name } = req.body

  try {
    const department = await prisma.department.update({
      where: { id },
      data: { name }
    })
    return res.status(200).json({ message: 'Département mis à jour', department })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Département introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.department.delete({ where: { id } })
    return res.status(200).json({ message: 'Département supprimé' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Département introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}