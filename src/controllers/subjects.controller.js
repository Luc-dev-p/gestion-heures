import prisma from '../lib/prisma.js'

// GET /api/subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { department: true }
    })
    return res.status(200).json(subjects)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/subjects/:id
export const getSubjectById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: true,
        teacherSubjects: {
          include: { teacher: true, academicYear: true }
        }
      }
    })
    if (!subject) return res.status(404).json({ message: 'Matière introuvable' })
    return res.status(200).json(subject)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// POST /api/subjects
export const createSubject = async (req, res) => {
  const { name, level, field, planned_hours, departmentId } = req.body

  if (!name || !level || !field || !planned_hours || !departmentId) {
    return res.status(400).json({ message: 'Tous les champs sont requis' })
  }

  try {
    const subject = await prisma.subject.create({
      data: { name, level, field, planned_hours, departmentId }
    })
    return res.status(201).json({ message: 'Matière créée', subject })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// PUT /api/subjects/:id
export const updateSubject = async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, level, field, planned_hours, departmentId } = req.body

  try {
    const subject = await prisma.subject.update({
      where: { id },
      data: { name, level, field, planned_hours, departmentId }
    })
    return res.status(200).json({ message: 'Matière mise à jour', subject })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Matière introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// DELETE /api/subjects/:id
export const deleteSubject = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.subject.delete({ where: { id } })
    return res.status(200).json({ message: 'Matière supprimée' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Matière introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}