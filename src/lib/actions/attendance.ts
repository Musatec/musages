"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export async function saveAttendance(data: {
  studentId: string; // talibeId
  status: AttendanceStatus;
  date: Date;
  reason?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    // Vérifier si une présence existe déjà pour cette date
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(data.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        daaraId,
        talibeId: data.studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: data.status,
          reason: data.reason,
        }
      });
    } else {
      await prisma.attendance.create({
        data: {
          daaraId,
          talibeId: data.studentId,
          date: data.date,
          status: data.status,
          reason: data.reason,
        }
      });
    }

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("[SAVE_ATTENDANCE_ERROR]", error);
    return { error: error.message || "Erreur lors de l'enregistrement de l'appel." };
  }
}

export async function markParentNotified(attendanceId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";
    if (!daaraId) return { error: "Non autorisé" };

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { parentNotified: true }
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du statut de notification." };
  }
}
