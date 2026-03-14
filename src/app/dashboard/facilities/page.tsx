import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { facilities } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteFacilityButton } from "./delete-button";

const NVOS_COLORS: Record<string, "danger" | "warning" | "info" | "default"> = {
  I: "danger",
  II: "warning",
  III: "info",
  IV: "default",
};

const NVOS_LABELS: Record<string, string> = {
  I: "I кат. — значительное воздействие",
  II: "II кат. — умеренное воздействие",
  III: "III кат. — незначительное воздействие",
  IV: "IV кат. — минимальное воздействие",
};

function FacilityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    </svg>
  );
}

export default async function FacilitiesPage() {
  const { user } = await requireSession();

  if (!user.orgId) {
    return <div className="text-gray-500">Организация не настроена</div>;
  }

  const orgFacilities = await db
    .select()
    .from(facilities)
    .where(eq(facilities.orgId, user.orgId))
    .orderBy(facilities.name);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Объекты НВОС</h1>
          <p className="text-sm text-gray-500 mt-0.5">Производственные объекты, оказывающие воздействие на окружающую среду</p>
        </div>
        <Link href="/dashboard/facilities/new">
          <Button>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
            Добавить объект
          </Button>
        </Link>
      </div>

      {orgFacilities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FacilityIcon />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Объектов НВОС пока нет</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            Добавьте производственный объект, чтобы начать подготовку отчётности
          </p>
          <Link href="/dashboard/facilities/new">
            <Button>Добавить первый объект</Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            НВОС — негативное воздействие на окружающую среду
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orgFacilities.map((facility) => (
            <div key={facility.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-green-200 hover:shadow-md transition-all px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                    <Badge variant={NVOS_COLORS[facility.nvosCategory]}>
                      НВОС {facility.nvosCategory}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{facility.address}</p>
                  {facility.nvosRegNumber && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Рег. номер: {facility.nvosRegNumber}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {NVOS_LABELS[facility.nvosCategory]}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/dashboard/facilities/${facility.id}`}>
                    <Button variant="secondary" size="sm">Изменить</Button>
                  </Link>
                  <DeleteFacilityButton id={facility.id} name={facility.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
