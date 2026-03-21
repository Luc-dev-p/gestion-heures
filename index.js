import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});
app.post("/teachers", async (req, res) => {
    console.log("BODY:", req.body);
  try {
    const { firstname, lastname, grade, status, hourly_rate, userId, departmentId } = req.body;

    const teacher = await prisma.teacher.create({
      data: {
        firstname,
        lastname,
        grade,
        status,
        hourly_rate,
        userId,
        departmentId,
      },
    });

    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.post("/users", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      email: "test@test.com",
      password: "1234",
      role: "TEACHER",
    },
  });

  res.json(user);
});
app.post("/users", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      email: "test@test.com",
      password: "1234",
      role: "TEACHER",
    },
  });

  res.json(user);
});