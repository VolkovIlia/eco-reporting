import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { reports, facilities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

function EmptyReportsState({ hasFacilities }: { hasFacilities: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Отчётов пока нет</h3>
      {hasFacilities ? (
        <>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            Создайте первый отчёт 2-ТП для вашего объекта НВОС
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            Сначала добавьте объект НВОС, затем создайте отчёт
          </p>
          <Link href="/dashboard/facilities/new">
            <Button>Добавить объект НВОС</Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            Шаг 1 из 2 — объект НВОС нужен для привязки отчётности
          </p>
        </>
      )}
    </div>
  );
}

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
  const hasFacilities = orgFacilities.length > 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            2-ТП Отходы · 2-ТП Воздух · 2-ТП Водхоз · ПЭК
          </p>
        </div>
        {hasFacilities && (
          <CreateReportButton facilities={orgFacilities} currentYear={currentYear} />
        )}
      </div>

      {allReports.length === 0 ? (
        <EmptyReportsState hasFacilities={hasFacilities} />
      ) : (
        <div className="space-y-2">
          {allReports.map((r) => {
            const statusInfo = STATUS_INFO[r.status] ?? { label: r.status, variant: "default" as const };
            const formPath = REPORT_FORM_PATHS[r.type];
            const reportLabel = REPORT_TYPES.find((t) => t.type === r.type)?.label ?? r.type;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-green-200 hover:shadow-md transition-all">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{reportLabel}</span>
                      <span className="text-gray-400 text-sm">—</span>
                      <span className="text-gray-600 text-sm">{r.year} год</span>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {facilityMap.get(r.facilityId) ?? `Объект #${r.facilityId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
