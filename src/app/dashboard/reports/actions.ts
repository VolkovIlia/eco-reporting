"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { reports, facilities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/session";

type ReportType = "2tp_waste" | "2tp_air" | "2tp_water";

export async function createReport(facilityId: number, type: ReportType, year: number) {
  const { user } = await requireSession();

  if (!user.orgId) throw new Error("Организация не настроена");

  // Verify facility belongs to user's org
  const [facility] = await db
    .select({ id: facilities.id })
    .from(facilities)
    .where(and(eq(facilities.id, facilityId), eq(facilities.orgId, user.orgId)))
    .limit(1);

  if (!facility) throw new Error("Объект не найден");

  const [report] = await db
    .insert(reports)
    .values({ facilityId, type, year, status: "draft", data: {} })
    .returning({ id: reports.id });

  revalidatePath("/dashboard/reports");
  redirect(`/dashboard/reports/${type.replace("2tp_", "")}?reportId=${report.id}`);
}

export async function saveReportData(reportId: number, data: Record<string, unknown>) {
  const { user } = await requireSession();
  if (!user.orgId) throw new Error("Организация не настроена");

  await db
    .update(reports)
    .set({ data, status: "draft", updatedAt: new Date() })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/reports");
}

export async function validateReport(reportId: number) {
  const { user } = await requireSession();
  if (!user.orgId) throw new Error("Организация не настроена");

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) throw new Error("Отчёт не найден");

  const errors = validateReportData(report.type, report.data as Record<string, unknown>);

  const status = errors.length === 0 ? "validated" : "draft";

  await db
    .update(reports)
    .set({ status, validationErrors: errors, updatedAt: new Date() })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/reports");
  return { valid: errors.length === 0, errors };
}

export async function submitReport(reportId: number) {
  await validateReport(reportId);

  await db
    .update(reports)
    .set({ status: "submitted", updatedAt: new Date() })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/reports");
}

export async function deleteReport(reportId: number) {
  const { user } = await requireSession();
  if (!user.orgId) throw new Error("Организация не настроена");

  await db.delete(reports).where(eq(reports.id, reportId));
  revalidatePath("/dashboard/reports");
}

function validateReportData(
  type: string,
  data: Record<string, unknown>
): Array<{ field: string; message: string; severity: "error" | "warning" }> {
  const errors: Array<{ field: string; message: string; severity: "error" | "warning" }> = [];

  if (type === "2tp_waste") {
    const rows = (data.rows as Array<Record<string, unknown>>) ?? [];
    if (rows.length === 0) {
      errors.push({ field: "rows", message: "Добавьте хотя бы одну строку отходов", severity: "error" });
      return errors;
    }
    rows.forEach((row, i) => {
      const start = Number(row.amountStart ?? 0);
      const generated = Number(row.amountGenerated ?? 0);
      const received = Number(row.amountReceived ?? 0);
      const used = Number(row.amountUsed ?? 0);
      const transferred = Number(row.amountTransferred ?? 0);
      const placed = Number(row.amountPlaced ?? 0);
      const end = Number(row.amountEnd ?? 0);
      const balance = start + generated + received - used - transferred - placed - end;
      if (Math.abs(balance) > 0.001) {
        errors.push({
          field: `rows[${i}].balance`,
          message: `Строка ${i + 1}: баланс не сходится (${balance.toFixed(3)} т)`,
          severity: "error",
          row: i,
        } as { field: string; message: string; severity: "error" | "warning"; row: number });
      }
    });
  }

  return errors;
}
