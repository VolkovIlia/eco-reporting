import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { deadlines } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

const REPORT_TYPE_LABELS: Record<string, string> = {
  "2tp_waste": "2-ТП Отходы",
  "2tp_air": "2-ТП Воздух",
  "2tp_water": "2-ТП Водхоз",
};

const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

interface UrgencyStyle {
  badge: string;
  label: string;
  icon: React.ReactNode;
}

function getUrgencyStyle(daysRemaining: number): UrgencyStyle {
  if (daysRemaining < 0) {
    return {
      badge: "bg-red-100 text-red-700 border border-red-200",
      label: `Просрочено на ${Math.abs(daysRemaining)} дн.`,
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    };
  }
  if (daysRemaining <= 7) {
    return {
      badge: "bg-red-100 text-red-700 border border-red-200",
      label: `${daysRemaining} дн.`,
      icon: null,
    };
  }
  if (daysRemaining <= 30) {
    return {
      badge: "bg-amber-100 text-amber-700 border border-amber-200",
      label: `${daysRemaining} дн.`,
      icon: null,
    };
  }
  return {
    badge: "bg-green-100 text-green-700 border border-green-200",
    label: `${daysRemaining} дн.`,
    icon: null,
  };
}

export default async function CalendarPage() {
  await requireSession();

  const year = new Date().getFullYear();
  const today = new Date();

  const yearDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.year, year))
    .orderBy(deadlines.deadlineDate);

  // Group by month
  const byMonth = new Map<number, typeof yearDeadlines>();
  for (const d of yearDeadlines) {
    const month = new Date(d.deadlineDate).getMonth();
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(d);
  }

  // Count overdue / upcoming
  const overdue = yearDeadlines.filter((d) => new Date(d.deadlineDate) < today).length;
  const soonCount = yearDeadlines.filter((d) => {
    const diff = (new Date(d.deadlineDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сроки сдачи</h1>
          <p className="text-sm text-gray-500 mt-0.5">Все дедлайны отчётности за {year} год</p>
        </div>
        <span className="text-sm text-gray-400">{year} год</span>
      </div>

      {/* Summary strip */}
      {yearDeadlines.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{yearDeadlines.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">всего дедлайнов</p>
          </div>
          <div className={["rounded-lg border px-4 py-3 text-center", overdue > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"].join(" ")}>
            <p className={["text-2xl font-bold", overdue > 0 ? "text-red-600" : "text-gray-900"].join(" ")}>{overdue}</p>
            <p className="text-xs text-gray-500 mt-0.5">просрочено</p>
          </div>
          <div className={["rounded-lg border px-4 py-3 text-center", soonCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"].join(" ")}>
            <p className={["text-2xl font-bold", soonCount > 0 ? "text-amber-600" : "text-gray-900"].join(" ")}>{soonCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">в ближайшие 30 дн.</p>
          </div>
        </div>
      )}

      {yearDeadlines.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">Нет данных о сроках на {year} год</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byMonth.entries()).map(([month, items]) => (
            <div key={month} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {MONTHS_RU[month]}
                </h3>
              </div>
              <div className="px-6 py-2 divide-y divide-gray-50">
                {items.map((item) => {
                  const deadlineDate = new Date(item.deadlineDate);
                  const diffMs = deadlineDate.getTime() - today.getTime();
                  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  const urgency = getUrgencyStyle(daysRemaining);

                  return (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {REPORT_TYPE_LABELS[item.reportType] ?? item.reportType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {deadlineDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Категории НВОС: {(item.nvosCategories as string[]).join(", ")}
                        </p>
                      </div>
                      <span className={[
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ml-4 shrink-0",
                        urgency.badge,
                      ].join(" ")}>
                        {urgency.icon}
                        {urgency.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
        <strong>Совет:</strong> Сдавайте отчёты за 2–3 дня до дедлайна, чтобы иметь время на исправление ошибок.
        Штраф за просрочку — от 10 000 до 300 000 ₽ по ст. 8.5 КоАП РФ.
      </div>
    </div>
  );
}
