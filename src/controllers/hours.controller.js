import prisma from '../lib/prisma.js'

// GET /api/hours — liste toutes les entrées (filtrables)
export const getAllHours = async (req, res) => {
  const { teacherId, academicYearId, status } = req.query

  try {
    const hours = await prisma.hourEntry.findMany({
      where: {
        ...(status && { status }),
        ...(academicYearId && { academicYearId: parseInt(academicYearId) }),
        ...(teacherId && {
          teacherSubject: { teacherId: parseInt(teacherId) }
        })
      },
      include: {
        teacherSubject: {
          include: {
            teacher: true,
            subject: true
          }
        },
        hourType: true,
        academicYear: true
      },
      orderBy: { date: 'desc' }
    })
    return res.status(200).json(hours)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/hours/:id
export const getHourById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const hour = await prisma.hourEntry.findUnique({
      where: { id },
      include: {
        teacherSubject: { include: { teacher: true, subject: true } },
        hourType: true,
        academicYear: true
      }
    })
    if (!hour) return res.status(404).json({ message: 'Entrée introuvable' })
    return res.status(200).json(hour)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// POST /api/hours
export const createHourEntry = async (req, res) => {
  const {
    teacherSubjectId,
    hourTypeId,
    date,
    start_time,
    end_time,
    room,
    note,
    academicYearId
  } = req.body

  if (!teacherSubjectId || !hourTypeId || !date || !start_time || !end_time || !room || !academicYearId) {
    return res.status(400).json({ message: 'Tous les champs obligatoires sont requis' })
  }

  try {
    // Calcul automatique de la durée
    const start = new Date(start_time)
    const end = new Date(end_time)
    const duration = (end - start) / (1000 * 60 * 60) // en heures

    if (duration <= 0) {
      return res.status(400).json({ message: 'L\'heure de fin doit être après l\'heure de début' })
    }

    const hourEntry = await prisma.hourEntry.create({
      data: {
        teacherSubjectId,
        hourTypeId,
        date: new Date(date),
        start_time: start,
        end_time: end,
        duration,
        room,
        note,
        status: 'DRAFT',
        academicYearId
      },
      include: {
        teacherSubject: { include: { teacher: true, subject: true } },
        hourType: true,
        academicYear: true
      }
    })

    return res.status(201).json({ message: 'Entrée créée', hourEntry })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// PATCH /api/hours/:id/status — valider ou marquer comme payé
export const updateHourStatus = async (req, res) => {
  const id = parseInt(req.params.id)
  const { status } = req.body

  if (!['DRAFT', 'VALIDATED', 'PAID'].includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' })
  }

  try {
    const hourEntry = await prisma.hourEntry.update({
      where: { id },
      data: { status }
    })
    return res.status(200).json({ message: 'Statut mis à jour', hourEntry })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Entrée introuvable' })
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// DELETE /api/hours/:id
export const deleteHourEntry = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const hour = await prisma.hourEntry.findUnique({ where: { id } })
    if (!hour) return res.status(404).json({ message: 'Entrée introuvable' })
    if (hour.status !== 'DRAFT') {
      return res.status(403).json({ message: 'Impossible de supprimer une entrée validée ou payée' })
    }

    await prisma.hourEntry.delete({ where: { id } })
    return res.status(200).json({ message: 'Entrée supprimée' })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/hours/summary/:teacherId — récapitulatif par enseignant
export const getTeacherSummary = async (req, res) => {
  const teacherId = parseInt(req.params.teacherId)
  const { academicYearId } = req.query

  try {
    // Récupérer le taux horaire de l'enseignant pour l'année
    const hourRate = await prisma.hourRate.findUnique({
      where: {
        teacherId_academicYearId: {
          teacherId,
          academicYearId: parseInt(academicYearId)
        }
      }
    })

    // Récupérer toutes les heures validées
    const hours = await prisma.hourEntry.findMany({
      where: {
        status: { in: ['VALIDATED', 'PAID'] },
        academicYearId: parseInt(academicYearId),
        teacherSubject: { teacherId }
      },
      include: { hourType: true }
    })

    // Calcul des totaux par type
    const summary = hours.reduce((acc, entry) => {
      const type = entry.hourType.name
      if (!acc[type]) acc[type] = 0
      acc[type] += entry.duration * entry.hourType.coefficient
      return acc
    }, {})

    const totalEquivalent = Object.values(summary).reduce((a, b) => a + b, 0)
    const contractHours = hourRate?.contractHours || 192
    const extraHours = Math.max(0, totalEquivalent - contractHours)
    const normalHours = totalEquivalent - extraHours

    const totalAmount = hourRate
      ? (normalHours * hourRate.normalRate) + (extraHours * hourRate.extraRate)
      : null

    return res.status(200).json({
      teacherId,
      academicYearId,
      byType: summary,
      totalEquivalentHours: totalEquivalent,
      contractHours,
      normalHours,
      extraHours,
      totalAmount,
      currency: 'FCFA'
    })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}
// GET /api/hours/teacher-subjects
export const getTeacherSubjects = async (req, res) => {
  try {
    const ts = await prisma.teacherSubject.findMany({
      include: {
        teacher: true,
        subject: true,
        academicYear: true
      }
    })
    return res.status(200).json(ts)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/hours/hour-types
export const getHourTypes = async (req, res) => {
  try {
    const types = await prisma.hourType.findMany()
    return res.status(200).json(types)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

