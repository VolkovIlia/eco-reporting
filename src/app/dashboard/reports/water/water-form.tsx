"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveReportData, validateReport, submitReport } from "../actions";

interface WaterRow {
  id: string;
  sourceType: string;
  sourceName: string;
  intakePlan: string;
  intakeActual: string;
  dischargePlan: string;
  dischargeActual: string;
}

interface Props {
  reportId: number;
  year: number;
  facilityName: string;
  initialData: Record<string, unknown>;
  status: string;
}

function newRow(): WaterRow {
  return {
    id: crypto.randomUUID(),
    sourceType: "Поверхностный",
    sourceName: "",
    intakePlan: "0",
    intakeActual: "0",
    dischargePlan: "0",
    dischargeActual: "0",
  };
}

export function WaterForm({ reportId, year, facilityName, initialData, status }: Props) {
  const [rows, setRows] = useState<WaterRow[]>(
    (initialData.rows as WaterRow[]) ?? [newRow()]
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState(status);
  const isSubmitted = currentStatus === "submitted";

  function updateRow(id: string, field: keyof WaterRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveReportData(reportId, { rows });
      setMessage("Черновик сохранён");
    } catch {
      setMessage("Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    await saveReportData(reportId, { rows });
    try {
      await submitReport(reportId);
      setCurrentStatus("submitted");
      setMessage("Отчёт сдан");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 py-3 border-b border-gray-100">
        <div><p className="text-xs text-gray-500">Объект</p><p className="font-medium text-sm">{facilityName}</p></div>
        <div><p className="text-xs text-gray-500">Год</p><p className="font-medium text-sm">{year}</p></div>
        <div>
          <p className="text-xs text-gray-500">Статус</p>
          <Badge variant={currentStatus === "submitted" ? "success" : "default"}>
            {currentStatus === "submitted" ? "Сдан" : "Черновик"}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1.5 text-left w-32">Тип источника</th>
              <th className="border border-gray-200 px-2 py-1.5 text-left">Наименование</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-24">Забор (план, тыс. м³)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-24">Забор (факт, тыс. м³)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-24">Сброс (план, тыс. м³)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-24">Сброс (факт, тыс. м³)</th>
              {!isSubmitted && <th className="border border-gray-200 w-8"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-1">
                  <select value={row.sourceType} onChange={(e) => updateRow(row.id, "sourceType", e.target.value)} disabled={isSubmitted} className="w-full text-xs outline-none disabled:bg-transparent">
                    {["Поверхностный", "Подземный", "Морской"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="border border-gray-200 px-1">
                  <input value={row.sourceName} onChange={(e) => updateRow(row.id, "sourceName", e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 outline-none disabled:bg-transparent" placeholder="р. Москва" />
                </td>
                {(["intakePlan", "intakeActual", "dischargePlan", "dischargeActual"] as const).map((f) => (
                  <td key={f} className="border border-gray-200 px-1">
                    <input type="number" step="0.001" min="0" value={row[f]} onChange={(e) => updateRow(row.id, f, e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 text-right outline-none disabled:bg-transparent" />
                  </td>
                ))}
                {!isSubmitted && (
                  <td className="border border-gray-200 px-1">
                    <button onClick={() => setRows((p) => p.filter((r) => r.id !== row.id))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isSubmitted && <Button variant="secondary" size="sm" onClick={() => setRows((p) => [...p, newRow()])}>+ Добавить строку</Button>}

      {message && <p className={["text-sm px-3 py-2 rounded", message.includes("Ошибка") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"].join(" ")}>{message}</p>}

      {!isSubmitted && (
        <div className="flex gap-3">
          <Button variant="secondary" loading={saving} onClick={handleSave}>Сохранить черновик</Button>
          <Button loading={submitting} onClick={handleSubmit}>Сдать отчёт</Button>
        </div>
      )}
    </div>
  );
}
