/*
  Warnings:

  - You are about to drop the column `hourly_rate` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `AcademicYear` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,subjectId,academicYearId]` on the table `TeacherSubject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `AcademicYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AcademicYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `HourEntry` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `grade` on the `Teacher` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `academicYearId` to the `TeacherSubject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeacherGrade" AS ENUM ('ASSISTANT', 'MAITRE_ASSISTANT', 'PROFESSEUR', 'AUTRE');

-- DropIndex
DROP INDEX "TeacherSubject_teacherId_subjectId_key";

-- AlterTable
ALTER TABLE "AcademicYear" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HourEntry" ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "hourly_rate",
DROP COLUMN "grade",
ADD COLUMN     "grade" "TeacherGrade" NOT NULL;

-- AlterTable
ALTER TABLE "TeacherSubject" ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "HourRate" (
    "id" SERIAL NOT NULL,
    "normalRate" DOUBLE PRECISION NOT NULL,
    "extraRate" DOUBLE PRECISION NOT NULL,
    "contractHours" DOUBLE PRECISION NOT NULL DEFAULT 192,
    "teacherId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,

    CONSTRAINT "HourRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HourRate_teacherId_academicYearId_key" ON "HourRate"("teacherId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubject_teacherId_subjectId_academicYearId_key" ON "TeacherSubject"("teacherId", "subjectId", "academicYearId");

-- AddForeignKey
ALTER TABLE "HourRate" ADD CONSTRAINT "HourRate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourRate" ADD CONSTRAINT "HourRate_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
