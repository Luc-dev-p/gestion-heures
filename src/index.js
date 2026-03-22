import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import teacherRoutes from './routes/teachers.routes.js'
import subjectRoutes from './routes/subjects.routes.js'
import hourRoutes from './routes/hours.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import departmentRoutes from './routes/departments.routes.js'
import academicYearRoutes from './routes/academic-years.routes.js'


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/hours', hourRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/academic-years', academicYearRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})