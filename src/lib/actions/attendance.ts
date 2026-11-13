"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";
import { DAARA_MANAGER_ROLES, getActiveSpace } from "@/lib/action-context";

const ATTENDANCE_ROLES = [...DAARA_MANAGER_ROLES, "OUSTAZ"] as const;

export async function saveAttendance(data: {
  studentId: string; // talibeId
  status: AttendanceStatus;
  date: Date;
  reason?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Session non valide ou Daara non configuré." };
    if (!ATTENDANCE_ROLES.includes(session.user.role as typeof ATTENDANCE_ROLES[number])) {
      return { error: "Non autorisé." };
    }
    if (!data || typeof data.studentId !== "string" || !data.studentId || !Object.values(AttendanceStatus).includes(data.status)) {
      return { error: "Les informations de présence ne sont pas valides." };
    }
    if (data.reason !== undefined && (typeof data.reason !== "string" || data.reason.length > 500)) {
      return { error: "Le motif dépasse la longueur autorisée." };
    }
    const attendanceDate = new Date(data.date);
    if (!Number.isFinite(attendanceDate.getTime())) return { error: "La date indiquée n'est pas valide." };
    const space = await getActiveSpace();
    const talibe = await prisma.talibe.findFirst({
      where: { id: data.studentId, daaraId, space, deletedAt: null },
      select: { id: true },
    });
    if (!talibe) return { error: "Talibé introuvable dans cet établissement." };

    // Vérifier si une présence existe déjà pour cette date
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        daaraId,
        space,
        talibeId: data.studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    if (existing) {
      const updated = await prisma.attendance.updateMany({
        where: { id: existing.id, daaraId, space, talibeId: data.studentId },
        data: {
          status: data.status,
          reason: data.reason,
        }
      });
      if (updated.count !== 1) return { error: "Présence introuvable." };
    } else {
      await prisma.attendance.create({
        data: {
          daaraId,
          space,
          talibeId: data.studentId,
          date: attendanceDate,
          status: data.status,
          reason: data.reason,
        }
      });
    }

    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("[SAVE_ATTENDANCE_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement de l'appel." };
  }
}

export async function markParentNotified(attendanceId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!ATTENDANCE_ROLES.includes(session.user.role as typeof ATTENDANCE_ROLES[number])) {
      return { error: "Non autorisé." };
    }
    if (typeof attendanceId !== "string" || !attendanceId) return { error: "Présence introuvable." };

    const result = await prisma.attendance.updateMany({
      where: { id: attendanceId, daaraId },
      data: { parentNotified: true }
    });
    if (result.count !== 1) return { error: "Présence introuvable." };

    revalidatePath("/attendance");
    return { success: true };
  } catch {
    return { error: "Erreur lors de la mise à jour du statut de notification." };
  }
}
