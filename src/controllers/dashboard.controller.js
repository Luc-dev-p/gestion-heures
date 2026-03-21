import prisma from '../lib/prisma.js'

// GET /api/dashboard/overview?academicYearId=1
export const getOverview = async (req, res) => {
  const { academicYearId } = req.query

  if (!academicYearId) {
    return res.status(400).json({ message: 'academicYearId requis' })
  }

  const yearId = parseInt(academicYearId)

  try {
    const [
      totalTeachers,
      totalSubjects,
      totalHours,
      pendingHours,
      totalDepartments
    ] = await Promise.all([
      prisma.teacher.count(),
      prisma.subject.count(),
      prisma.hourEntry.aggregate({
        where: { academicYearId: yearId, status: { in: ['VALIDATED', 'PAID'] } },
        _sum: { duration: true }
      }),
      prisma.hourEntry.count({
        where: { academicYearId: yearId, status: 'DRAFT' }
      }),
      prisma.department.count()
    ])

    return res.status(200).json({
      totalTeachers,
      totalSubjects,
      totalDepartments,
      totalValidatedHours: totalHours._sum.duration || 0,
      pendingHours
    })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/dashboard/by-department?academicYearId=1
export const getHoursByDepartment = async (req, res) => {
  const { academicYearId } = req.query
  const yearId = parseInt(academicYearId)

  try {
    const departments = await prisma.department.findMany({
      include: {
        teachers: {
          include: {
            teacherSubjects: {
              where: { academicYearId: yearId },
              include: {
                hourEntries: {
                  where: {
                    academicYearId: yearId,
                    status: { in: ['VALIDATED', 'PAID'] }
                  },
                  include: { hourType: true }
                }
              }
            }
          }
        }
      }
    })

    const result = departments.map(dept => {
      let totalHours = 0
      dept.teachers.forEach(teacher => {
        teacher.teacherSubjects.forEach(ts => {
          ts.hourEntries.forEach(entry => {
            totalHours += entry.duration * entry.hourType.coefficient
          })
        })
      })

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        teacherCount: dept.teachers.length,
        totalEquivalentHours: totalHours
      }
    })

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/dashboard/overload?academicYearId=1
export const getOverloadedTeachers = async (req, res) => {
  const { academicYearId } = req.query
  const yearId = parseInt(academicYearId)

  try {
    const hourRates = await prisma.hourRate.findMany({
      where: { academicYearId: yearId },
      include: {
        teacher: {
          include: {
            teacherSubjects: {
              where: { academicYearId: yearId },
              include: {
                hourEntries: {
                  where: {
                    academicYearId: yearId,
                    status: { in: ['VALIDATED', 'PAID'] }
                  },
                  include: { hourType: true }
                }
              }
            }
          }
        }
      }
    })

    const result = hourRates
      .map(hr => {
        let totalHours = 0
        hr.teacher.teacherSubjects.forEach(ts => {
          ts.hourEntries.forEach(entry => {
            totalHours += entry.duration * entry.hourType.coefficient
          })
        })

        const extraHours = Math.max(0, totalHours - hr.contractHours)

        return {
          teacherId: hr.teacherId,
          teacherName: `${hr.teacher.firstname} ${hr.teacher.lastname}`,
          contractHours: hr.contractHours,
          totalEquivalentHours: totalHours,
          extraHours
        }
      })
      .filter(t => t.extraHours > 0)
      .sort((a, b) => b.extraHours - a.extraHours)

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/dashboard/monthly?academicYearId=1
export const getMonthlyStats = async (req, res) => {
  const { academicYearId } = req.query
  const yearId = parseInt(academicYearId)

  try {
    const hours = await prisma.hourEntry.findMany({
      where: {
        academicYearId: yearId,
        status: { in: ['VALIDATED', 'PAID'] }
      },
      include: { hourType: true },
      orderBy: { date: 'asc' }
    })

    const monthly = {}
    hours.forEach(entry => {
      const month = entry.date.toISOString().slice(0, 7) // "2024-11"
      if (!monthly[month]) monthly[month] = 0
      monthly[month] += entry.duration * entry.hourType.coefficient
    })

    const result = Object.entries(monthly).map(([month, totalHours]) => ({
      month,
      totalEquivalentHours: totalHours
    }))

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}