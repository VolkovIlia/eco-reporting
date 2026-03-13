"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveReportData, validateReport, submitReport } from "../actions";

interface AirRow {
  id: string;
  pollutantCode: string;
  pollutantName: string;
  emissionsPlan: string;
  emissionsActual: string;
  unit: string;
}

interface Props {
  reportId: number;
  year: number;
  facilityName: string;
  initialData: Record<string, unknown>;
  status: string;
}

function newRow(): AirRow {
  return {
    id: crypto.randomUUID(),
    pollutantCode: "",
    pollutantName: "",
    emissionsPlan: "0",
    emissionsActual: "0",
    unit: "т/год",
  };
}

export function AirForm({ reportId, year, facilityName, initialData, status }: Props) {
  const [rows, setRows] = useState<AirRow[]>(
    (initialData.rows as AirRow[]) ?? [newRow()]
  );
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState(status);

  const isSubmitted = currentStatus === "submitted";

  function updateRow(id: string, field: keyof AirRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveReportData(reportId, { rows });
      setMessage("Черновик сохранён");
    } catch {
      setMessage("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate() {
    setValidating(true);
    await saveReportData(reportId, { rows });
    try {
      const result = await validateReport(reportId);
      if (result.valid) {
        setCurrentStatus("validated");
        setMessage("Проверка пройдена");
      } else {
        setMessage(`Ошибок: ${result.errors.length}`);
      }
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
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
        <div><p className="text-xs text-gray-500">Статус</p>
          <Badge variant={currentStatus === "submitted" ? "success" : currentStatus === "validated" ? "info" : "default"}>
            {currentStatus === "submitted" ? "Сдан" : currentStatus === "validated" ? "Проверен" : "Черновик"}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1.5 text-left w-24">Код</th>
              <th className="border border-gray-200 px-2 py-1.5 text-left">Загрязняющее вещество</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-28">По норм. (т/год)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-28">Факт (т/год)</th>
              {!isSubmitted && <th className="border border-gray-200 w-8"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-1">
                  <input value={row.pollutantCode} onChange={(e) => updateRow(row.id, "pollutantCode", e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 outline-none disabled:bg-transparent" placeholder="0301" />
                </td>
                <td className="border border-gray-200 px-1">
                  <input value={row.pollutantName} onChange={(e) => updateRow(row.id, "pollutantName", e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 outline-none disabled:bg-transparent" placeholder="Диоксид азота" />
                </td>
                <td className="border border-gray-200 px-1">
                  <input type="number" step="0.0001" min="0" value={row.emissionsPlan} onChange={(e) => updateRow(row.id, "emissionsPlan", e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 text-right outline-none disabled:bg-transparent" />
                </td>
                <td className="border border-gray-200 px-1">
                  <input type="number" step="0.0001" min="0" value={row.emissionsActual} onChange={(e) => updateRow(row.id, "emissionsActual", e.target.value)} disabled={isSubmitted} className="w-full px-1 py-0.5 text-right outline-none disabled:bg-transparent" />
                </td>
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
          <Button variant="secondary" loading={validating} onClick={handleValidate}>Проверить</Button>
          <Button loading={submitting} onClick={handleSubmit} disabled={currentStatus === "draft"}>Сдать отчёт</Button>
        </div>
      )}
    </div>
  );
}
