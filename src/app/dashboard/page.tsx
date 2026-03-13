import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { deadlines, reports, facilities } from "@/db/schema";
import { eq, gte, and, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const REPORT_TYPE_LABELS: Record<string, string> = {
  "2tp_waste": "2-ТП Отходы",
  "2tp_air": "2-ТП Воздух",
  "2tp_water": "2-ТП Водхоз",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "warning" | "success" | "info" }> = {
  draft: { label: "Черновик", variant: "default" },
  validated: { label: "Проверен", variant: "info" },
  submitted: { label: "Сдан", variant: "success" },
};

function urgencyVariant(days: number): "success" | "warning" | "danger" | "default" {
  if (days < 0) return "danger";
  if (days <= 7) return "danger";
  if (days <= 30) return "warning";
  return "success";
}

export default async function DashboardPage() {
  const { user } = await requireSession();

  if (!user.orgId) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Добро пожаловать в ЭкоОтчёт</h1>
        <Card>
          <p className="text-gray-600">Организация не настроена. Обратитесь к администратору.</p>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const year = today.getFullYear();

  // Fetch deadlines for current year
  const upcomingDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.year, year))
    .orderBy(deadlines.deadlineDate);

  // Fetch org facilities
  const orgFacilities = await db
    .select()
    .from(facilities)
    .where(eq(facilities.orgId, user.orgId));

  // Fetch recent reports
  const recentReports = await db
    .select({
      id: reports.id,
      type: reports.type,
      year: reports.year,
      status: reports.status,
      facilityId: reports.facilityId,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .orderBy(desc(reports.updatedAt))
    .limit(5);

  const deadlineWithDays = upcomingDeadlines.map((d) => {
    const deadline = new Date(d.deadlineDate);
    const diffMs = deadline.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...d, daysRemaining };
  });

  const facilityMap = new Map(orgFacilities.map((f) => [f.id, f.name]));

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Главная</h1>
        <span className="text-sm text-gray-500">{year} год</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-0">
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500">Объектов</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{orgFacilities.length}</p>
          </div>
        </Card>
        <Card className="p-0">
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500">Отчётов (всего)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{recentReports.length}</p>
          </div>
        </Card>
        <Card className="p-0">
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500">Сдано</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {recentReports.filter((r) => r.status === "submitted").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Upcoming deadlines */}
      <Card title="Ближайшие сроки сдачи">
        {deadlineWithDays.length === 0 ? (
          <p className="text-gray-500 text-sm">Нет данных о сроках</p>
        ) : (
          <div className="space-y-3">
            {deadlineWithDays.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {REPORT_TYPE_LABELS[d.reportType] ?? d.reportType}
                  </p>
                  <p className="text-xs text-gray-500">{d.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {new Date(d.deadlineDate).toLocaleDateString("ru-RU")}
                  </span>
                  <Badge variant={urgencyVariant(d.daysRemaining)}>
                    {d.daysRemaining < 0
                      ? `Просрочено на ${Math.abs(d.daysRemaining)} дн.`
                      : `${d.daysRemaining} дн.`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent reports */}
      <Card title="Последние отчёты">
        {recentReports.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">Отчётов пока нет</p>
            <Link
              href="/dashboard/reports"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Создать первый отчёт
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentReports.map((r) => {
              const statusInfo = STATUS_LABELS[r.status] ?? { label: r.status, variant: "default" as const };
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {REPORT_TYPE_LABELS[r.type] ?? r.type} — {r.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      {facilityMap.get(r.facilityId) ?? `Объект #${r.facilityId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <Link
                      href={`/dashboard/reports`}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Открыть
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
