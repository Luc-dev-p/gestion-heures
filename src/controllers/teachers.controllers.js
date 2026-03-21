import prisma from '../lib/prisma.js'

// GET /api/teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { email: true, role: true } },
        department: true
      }
    })
    return res.status(200).json(teachers)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/teachers/:id
export const getTeacherById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        department: true,
        hourRates: { include: { academicYear: true } },
        teacherSubjects: {
          include: {
            subject: true,
            academicYear: true
          }
        }
      }
    })
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable' })
    return res.status(200).json(teacher)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// POST /api/teachers
export const createTeacher = async (req, res) => {
  const {
    email, password,
    firstname, lastname, grade, status,
    departmentId
  } = req.body

  if (!email || !password || !firstname || !lastname || !grade || !status || !departmentId) {
    return res.status(400).json({ message: 'Tous les champs sont requis' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email déjà utilisé' })

    const bcrypt = await import('bcrypt')
    const hashed = await bcrypt.default.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'TEACHER',
        teacher: {
          create: {
            firstname,
            lastname,
            grade,
            status,
            departmentId
          }
        }
      },
      include: { teacher: true }
    })

    return res.status(201).json({
      message: 'Enseignant créé',
      teacher: user.teacher,
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// PUT /api/teachers/:id
export const updateTeacher = async (req, res) => {
  const id = parseInt(req.params.id)
  const { firstname, lastname, grade, status, departmentId } = req.body

  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { firstname, lastname, grade, status, departmentId }
    })
    return res.status(200).json({ message: 'Enseignant mis à jour', teacher })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Enseignant introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } })
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable' })

    // Supprimer l'user lié (cascade sur teacher)
    await prisma.user.delete({ where: { id: teacher.userId } })

    return res.status(200).json({ message: 'Enseignant supprimé' })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}