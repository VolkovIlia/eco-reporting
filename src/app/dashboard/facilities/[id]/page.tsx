import { notFound } from "next/navigation";
import { db } from "@/db";
import { facilities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { FacilityForm } from "@/components/facility-form";
import { updateFacility } from "../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFacilityPage({ params }: Props) {
  const { user } = await requireSession();
  const { id } = await params;
  const facilityId = Number(id);

  if (isNaN(facilityId) || !user.orgId) {
    notFound();
  }

  const [facility] = await db
    .select()
    .from(facilities)
    .where(and(eq(facilities.id, facilityId), eq(facilities.orgId, user.orgId)))
    .limit(1);

  if (!facility) {
    notFound();
  }

  async function updateAction(formData: FormData) {
    "use server";
    await updateFacility(facilityId, formData);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Редактировать объект</h1>
      <Card>
        <FacilityForm
          defaultValues={{
            name: facility.name,
            address: facility.address,
            nvosCategory: facility.nvosCategory,
            nvosRegNumber: facility.nvosRegNumber ?? "",
            okved: facility.okved ?? "",
          }}
          action={updateAction}
          submitLabel="Сохранить изменения"
        />
      </Card>
    </div>
  );
}
