"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveReportData, validateReport, submitReport } from "../actions";

interface WasteRow {
  id: string;
  wasteCode: string;
  wasteName: string;
  hazardClass: string;
  amountStart: string;
  amountGenerated: string;
  amountReceived: string;
  amountUsed: string;
  amountTransferred: string;
  amountPlaced: string;
  amountEnd: string;
}

interface Props {
  reportId: number;
  year: number;
  facilityName: string;
  initialData: Record<string, unknown>;
  status: string;
}

const HAZARD_CLASSES = ["I", "II", "III", "IV", "V"];

function newRow(): WasteRow {
  return {
    id: crypto.randomUUID(),
    wasteCode: "",
    wasteName: "",
    hazardClass: "V",
    amountStart: "0",
    amountGenerated: "0",
    amountReceived: "0",
    amountUsed: "0",
    amountTransferred: "0",
    amountPlaced: "0",
    amountEnd: "0",
  };
}

function calcBalance(row: WasteRow): number {
  const s = Number(row.amountStart);
  const g = Number(row.amountGenerated);
  const r = Number(row.amountReceived);
  const u = Number(row.amountUsed);
  const t = Number(row.amountTransferred);
  const p = Number(row.amountPlaced);
  const e = Number(row.amountEnd);
  return s + g + r - u - t - p - e;
}

export function WasteForm({ reportId, year, facilityName, initialData, status }: Props) {
  const [rows, setRows] = useState<WasteRow[]>(
    (initialData.rows as WasteRow[] | undefined) ?? [newRow()]
  );
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [currentStatus, setCurrentStatus] = useState(status);

  const isSubmitted = currentStatus === "submitted";

  function updateRow(id: string, field: keyof WasteRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
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
    setErrors([]);
    setMessage("");
    await saveReportData(reportId, { rows });
    try {
      const result = await validateReport(reportId);
      setErrors(result.errors);
      if (result.valid) {
        setMessage("Проверка пройдена успешно");
        setCurrentStatus("validated");
      } else {
        setMessage(`Найдено ошибок: ${result.errors.length}`);
      }
    } catch {
      setMessage("Ошибка проверки");
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setMessage("");
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
      {/* Header info */}
      <div className="flex items-center gap-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm text-gray-500">Объект</p>
          <p className="font-medium">{facilityName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Год</p>
          <p className="font-medium">{year}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Статус</p>
          <Badge variant={currentStatus === "submitted" ? "success" : currentStatus === "validated" ? "info" : "default"}>
            {currentStatus === "submitted" ? "Сдан" : currentStatus === "validated" ? "Проверен" : "Черновик"}
          </Badge>
        </div>
      </div>

      {/* Waste rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1.5 text-left min-w-[120px]">Код ФККО</th>
              <th className="border border-gray-200 px-2 py-1.5 text-left min-w-[180px]">Наименование</th>
              <th className="border border-gray-200 px-2 py-1.5 text-center w-12">Класс</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">На нач. (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">Образовано (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">Получено (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">Использ. (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">Передано (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">Размещено (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-right w-20">На кон. (т)</th>
              <th className="border border-gray-200 px-2 py-1.5 text-center w-16">Баланс</th>
              {!isSubmitted && <th className="border border-gray-200 px-2 py-1.5 w-8"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const balance = calcBalance(row);
              const balanceOk = Math.abs(balance) < 0.001;
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-1">
                    <input
                      value={row.wasteCode}
                      onChange={(e) => updateRow(row.id, "wasteCode", e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-1 py-0.5 text-xs outline-none disabled:bg-transparent"
                      placeholder="00 00 000 00 00 0"
                    />
                  </td>
                  <td className="border border-gray-200 px-1">
                    <input
                      value={row.wasteName}
                      onChange={(e) => updateRow(row.id, "wasteName", e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-1 py-0.5 text-xs outline-none disabled:bg-transparent"
                      placeholder="Наименование отхода"
                    />
                  </td>
                  <td className="border border-gray-200 px-1">
                    <select
                      value={row.hazardClass}
                      onChange={(e) => updateRow(row.id, "hazardClass", e.target.value)}
                      disabled={isSubmitted}
                      className="w-full text-xs outline-none disabled:bg-transparent"
                    >
                      {HAZARD_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  {(["amountStart", "amountGenerated", "amountReceived", "amountUsed", "amountTransferred", "amountPlaced", "amountEnd"] as const).map((field) => (
                    <td key={field} className="border border-gray-200 px-1">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={row[field]}
                        onChange={(e) => updateRow(row.id, field, e.target.value)}
                        disabled={isSubmitted}
                        className="w-full px-1 py-0.5 text-xs text-right outline-none disabled:bg-transparent"
                      />
                    </td>
                  ))}
                  <td className={["border border-gray-200 px-1 py-0.5 text-center text-xs font-medium", balanceOk ? "text-green-600" : "text-red-600"].join(" ")}>
                    {balanceOk ? "✓" : balance.toFixed(2)}
                  </td>
                  {!isSubmitted && (
                    <td className="border border-gray-200 px-1">
                      <button onClick={() => removeRow(row.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isSubmitted && (
        <Button variant="secondary" size="sm" onClick={addRow}>
          + Добавить строку
        </Button>
      )}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm font-medium text-red-700 mb-2">Ошибки проверки:</p>
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-600">• {e.message}</p>
          ))}
        </div>
      )}

      {message && (
        <p className={["text-sm px-3 py-2 rounded", message.includes("Ошибка") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"].join(" ")}>
          {message}
        </p>
      )}

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" loading={saving} onClick={handleSave}>
            Сохранить черновик
          </Button>
          <Button variant="secondary" loading={validating} onClick={handleValidate}>
            Проверить
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit}
            disabled={currentStatus === "draft"}
          >
            Сдать отчёт
          </Button>
        </div>
      )}
    </div>
  );
}
