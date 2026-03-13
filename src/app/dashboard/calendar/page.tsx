import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { deadlines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPORT_TYPE_LABELS: Record<string, string> = {
  "2tp_waste": "2-ТП Отходы",
  "2tp_air": "2-ТП Воздух",
  "2tp_water": "2-ТП Водхоз",
};

const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function urgencyInfo(daysRemaining: number): { label: string; variant: "success" | "warning" | "danger" | "default" } {
  if (daysRemaining < 0) return { label: "Просрочено", variant: "danger" };
  if (daysRemaining <= 7) return { label: `${daysRemaining} дн.`, variant: "danger" };
  if (daysRemaining <= 30) return { label: `${daysRemaining} дн.`, variant: "warning" };
  return { label: `${daysRemaining} дн.`, variant: "success" };
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Сроки сдачи</h1>
        <span className="text-sm text-gray-500">{year} год</span>
      </div>

      {yearDeadlines.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-sm text-center py-4">
            Нет данных о сроках. Запустите seed для заполнения.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(byMonth.entries()).map(([month, items]) => (
            <Card key={month} title={MONTHS_RU[month]}>
              <div className="space-y-3">
                {items.map((item) => {
                  const deadlineDate = new Date(item.deadlineDate);
                  const diffMs = deadlineDate.getTime() - today.getTime();
                  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  const { label, variant } = urgencyInfo(daysRemaining);

                  return (
                    <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">
                            {REPORT_TYPE_LABELS[item.reportType] ?? item.reportType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {deadlineDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Категории НВОС: {(item.nvosCategories as string[]).join(", ")}
                        </p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
