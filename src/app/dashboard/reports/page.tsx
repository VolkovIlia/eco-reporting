import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { reports, facilities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateReportButton } from "./create-report-button";

const REPORT_TYPES = [
  { type: "2tp_waste", label: "2-ТП Отходы" },
  { type: "2tp_air", label: "2-ТП Воздух" },
  { type: "2tp_water", label: "2-ТП Водхоз" },
] as const;

const STATUS_INFO: Record<string, { label: string; variant: "default" | "info" | "success" }> = {
  draft: { label: "Черновик", variant: "default" },
  validated: { label: "Проверен", variant: "info" },
  submitted: { label: "Сдан", variant: "success" },
};

const REPORT_FORM_PATHS: Record<string, string> = {
  "2tp_waste": "/dashboard/reports/waste",
  "2tp_air": "/dashboard/reports/air",
  "2tp_water": "/dashboard/reports/water",
};

export default async function ReportsPage() {
  const { user } = await requireSession();
  if (!user.orgId) return <div className="text-gray-500">Организация не настроена</div>;

  const orgFacilities = await db
    .select()
    .from(facilities)
    .where(eq(facilities.orgId, user.orgId));

  const allReports = await db
    .select({
      id: reports.id,
      facilityId: reports.facilityId,
      type: reports.type,
      year: reports.year,
      status: reports.status,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .orderBy(desc(reports.updatedAt));

  const facilityMap = new Map(orgFacilities.map((f) => [f.id, f.name]));
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
        {orgFacilities.length > 0 && (
          <CreateReportButton facilities={orgFacilities} currentYear={currentYear} />
        )}
      </div>

      {allReports.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Отчётов нет</p>
            <p className="text-sm text-gray-400">
              Добавьте объект НВОС, затем создайте отчёт
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {allReports.map((r) => {
            const statusInfo = STATUS_INFO[r.status] ?? { label: r.status, variant: "default" as const };
            const formPath = REPORT_FORM_PATHS[r.type];
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow p-0">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {REPORT_TYPES.find((t) => t.type === r.type)?.label ?? r.type}
                      </span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-600">{r.year} год</span>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {facilityMap.get(r.facilityId) ?? `Объект #${r.facilityId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(r.updatedAt).toLocaleDateString("ru-RU")}
                    </span>
                    {formPath && (
                      <Link href={`${formPath}?reportId=${r.id}`}>
                        <Button variant="secondary" size="sm">Открыть</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
