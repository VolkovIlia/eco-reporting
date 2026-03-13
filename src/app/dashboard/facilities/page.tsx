import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { facilities } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeleteFacilityButton } from "./delete-button";

const NVOS_COLORS: Record<string, "danger" | "warning" | "info" | "default"> = {
  I: "danger",
  II: "warning",
  III: "info",
  IV: "default",
};

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
        <h1 className="text-2xl font-bold text-gray-900">Объекты НВОС</h1>
        <Link href="/dashboard/facilities/new">
          <Button>+ Добавить объект</Button>
        </Link>
      </div>

      {orgFacilities.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Объекты не добавлены</p>
            <Link href="/dashboard/facilities/new">
              <Button>Добавить первый объект</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {orgFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
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
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/facilities/${facility.id}`}>
                    <Button variant="secondary" size="sm">Изменить</Button>
                  </Link>
                  <DeleteFacilityButton id={facility.id} name={facility.name} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
