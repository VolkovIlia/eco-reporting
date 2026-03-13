import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { reports, facilities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { WasteForm } from "./waste-form";

interface Props {
  searchParams: Promise<{ reportId?: string }>;
}

export default async function WasteReportPage({ searchParams }: Props) {
  const { user } = await requireSession();
  const { reportId: reportIdStr } = await searchParams;

  if (!reportIdStr) {
    redirect("/dashboard/reports");
  }

  const reportId = Number(reportIdStr);
  if (isNaN(reportId)) notFound();

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report || report.type !== "2tp_waste") notFound();

  const [facility] = await db
    .select({ name: facilities.name, orgId: facilities.orgId })
    .from(facilities)
    .where(eq(facilities.id, report.facilityId))
    .limit(1);

  if (!facility || facility.orgId !== user.orgId) notFound();

  return (
    <div className="max-w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">2-ТП Отходы</h1>
        <p className="text-sm text-gray-500 mt-1">
          Форма федерального статистического наблюдения № 2-ТП (отходы)
        </p>
      </div>
      <Card>
        <WasteForm
          reportId={reportId}
          year={report.year}
          facilityName={facility.name}
          initialData={(report.data as Record<string, unknown>) ?? {}}
          status={report.status}
        />
      </Card>
    </div>
  );
}
