import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { deadlines, reports, facilities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function OnboardingBanner() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-green-900 mb-1">Добро пожаловать в ЭкоОтчёт!</h2>
      <p className="text-sm text-green-700 mb-4">Чтобы начать работу, выполните три шага:</p>
      <div className="space-y-2">
        {[
          { n: "1", label: "Добавьте объект НВОС", href: "/dashboard/facilities/new", done: false },
          { n: "2", label: "Создайте первый отчёт", href: "/dashboard/reports", done: false },
          { n: "3", label: "Экспортируйте в PDF", href: "/dashboard/reports", done: false },
        ].map((step) => (
          <Link
            key={step.n}
            href={step.href}
            className="flex items-center gap-3 text-sm text-green-800 hover:text-green-900 group"
          >
            <span className="w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
              {step.n}
            </span>
            {step.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 ml-auto">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
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

  const upcomingDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.year, year))
    .orderBy(deadlines.deadlineDate);

  const orgFacilities = await db
    .select()
    .from(facilities)
    .where(eq(facilities.orgId, user.orgId));

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
  const submittedCount = recentReports.filter((r) => r.status === "submitted").length;
  const isNewUser = orgFacilities.length === 0 && recentReports.length === 0;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Главная</h1>
          <p className="text-sm text-gray-500 mt-0.5">Отчётный период: {year} год</p>
        </div>
        <Link
          href="/dashboard/facilities/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Добавить объект
        </Link>
      </div>

      {/* Onboarding for new users */}
      {isNewUser && <OnboardingBanner />}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Объекты НВОС" value={orgFacilities.length} sub="производственных объектов" />
        <StatCard label="Отчётов создано" value={recentReports.length} sub={`за ${year} год`} />
        <StatCard label="Отчётов сдано" value={submittedCount} sub="в Росприроднадзор" />
      </div>

      {/* Upcoming deadlines */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Ближайшие сроки сдачи</h3>
          <Link href="/dashboard/calendar" className="text-xs text-green-600 hover:underline font-medium">
            Все сроки →
          </Link>
        </div>
        <div className="px-6 py-2">
          {deadlineWithDays.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Нет данных о сроках</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {deadlineWithDays.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {REPORT_TYPE_LABELS[d.reportType] ?? d.reportType}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
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
        </div>
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Последние отчёты</h3>
          <Link href="/dashboard/reports" className="text-xs text-green-600 hover:underline font-medium">
            Все отчёты →
          </Link>
        </div>
        <div className="px-6 py-2">
          {recentReports.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-1">Отчётов пока нет</p>
              {orgFacilities.length === 0 ? (
                <Link href="/dashboard/facilities/new" className="text-sm text-green-600 hover:underline font-medium">
                  Сначала добавьте объект НВОС →
                </Link>
              ) : (
                <Link href="/dashboard/reports" className="text-sm text-green-600 hover:underline font-medium">
                  Создать первый отчёт →
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentReports.map((r) => {
                const statusInfo = STATUS_LABELS[r.status] ?? { label: r.status, variant: "default" as const };
                return (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {REPORT_TYPE_LABELS[r.type] ?? r.type} — {r.year}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {facilityMap.get(r.facilityId) ?? `Объект #${r.facilityId}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <Link
                        href="/dashboard/reports"
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
        </div>
      </div>
    </div>
  );
}
