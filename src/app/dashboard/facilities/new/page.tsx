import { Card } from "@/components/ui/card";
import { FacilityForm } from "@/components/facility-form";
import { createFacility } from "../actions";

export default function NewFacilityPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Добавить объект НВОС</h1>
      <Card>
        <FacilityForm action={createFacility} submitLabel="Добавить объект" />
      </Card>
    </div>
  );
}
