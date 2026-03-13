"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { createReport } from "./actions";

interface Facility {
  id: number;
  name: string;
}

interface Props {
  facilities: Facility[];
  currentYear: number;
}

const REPORT_TYPE_OPTIONS = [
  { value: "2tp_waste", label: "2-ТП Отходы" },
  { value: "2tp_air", label: "2-ТП Воздух" },
  { value: "2tp_water", label: "2-ТП Водхоз" },
];

export function CreateReportButton({ facilities, currentYear }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facilityId, setFacilityId] = useState(String(facilities[0]?.id ?? ""));
  const [type, setType] = useState("2tp_waste");
  const [year, setYear] = useState(String(currentYear - 1));

  const facilityOptions = facilities.map((f) => ({ value: String(f.id), label: f.name }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  });

  async function handleCreate() {
    setLoading(true);
    try {
      await createReport(
        Number(facilityId),
        type as "2tp_waste" | "2tp_air" | "2tp_water",
        Number(year)
      );
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Создать отчёт</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Создать отчёт">
        <div className="flex flex-col gap-4">
          <Select
            label="Объект"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            options={facilityOptions}
            required
          />
          <Select
            label="Форма отчётности"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={REPORT_TYPE_OPTIONS}
            required
          />
          <Select
            label="Отчётный год"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={yearOptions}
            required
          />
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button loading={loading} onClick={handleCreate}>
              Создать
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
