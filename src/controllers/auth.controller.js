import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

// POST /api/auth/register
export const register = async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, mot de passe et rôle requis' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'Email déjà utilisé' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashed, role }
    })

    return res.status(201).json({
      message: 'Utilisateur créé',
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}

// GET /api/auth/me
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        teacher: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            grade: true,
            status: true
          }
        }
      }
    })

    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message })
  }
}