"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WasteItem {
  id: number;
  code: string;
  name: string;
  hazardClass: string;
}

interface PollutantItem {
  id: number;
  code: string;
  name: string;
  hazardClass: string | null;
  unit: string;
}

const HAZARD_VARIANTS: Record<string, "danger" | "warning" | "info" | "default" | "success"> = {
  I: "danger", II: "warning", III: "info", IV: "success", V: "default",
};

export default function ReferencePage() {
  const [tab, setTab] = useState<"waste" | "pollutants">("waste");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(WasteItem | PollutantItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (query.length < 2) return;
    setLoading(true);
    setSearched(true);

    const endpoint = tab === "waste" ? "/api/reference/waste" : "/api/reference/pollutants";
    const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&limit=30`);

    if (res.ok) {
      const data = await res.json();
      setResults(data);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>

      <div className="flex gap-2">
        <button
          onClick={() => { setTab("waste"); setResults([]); setSearched(false); }}
          className={["px-4 py-2 rounded-md text-sm font-medium transition-colors", tab === "waste" ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"].join(" ")}
        >
          ФККО (отходы)
        </button>
        <button
          onClick={() => { setTab("pollutants"); setResults([]); setSearched(false); }}
          className={["px-4 py-2 rounded-md text-sm font-medium transition-colors", tab === "pollutants" ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"].join(" ")}
        >
          Загрязняющие вещества
        </button>
      </div>

      <Card>
        <div className="flex gap-3 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tab === "waste" ? "Поиск по коду или названию..." : "Поиск по коду, названию или CAS..."}
            className="flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={query.length < 2 || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition-colors"
          >
            {loading ? "..." : "Найти"}
          </button>
        </div>

        {searched && results.length === 0 && !loading && (
          <p className="text-gray-500 text-sm text-center py-4">Ничего не найдено</p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {tab === "waste" && (results as WasteItem[]).map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <Badge variant={HAZARD_VARIANTS[item.hazardClass] ?? "default"}>
                  Класс {item.hazardClass}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-mono text-gray-700">{item.code}</p>
                  <p className="text-sm text-gray-900">{item.name}</p>
                </div>
              </div>
            ))}
            {tab === "pollutants" && (results as PollutantItem[]).map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                {item.hazardClass && (
                  <Badge variant={HAZARD_VARIANTS[item.hazardClass] ?? "default"}>
                    Класс {item.hazardClass}
                  </Badge>
                )}
                <div className="flex-1">
                  <p className="text-sm font-mono text-gray-700">{item.code}</p>
                  <p className="text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searched && (
          <p className="text-gray-400 text-sm text-center py-4">
            Введите запрос (минимум 2 символа) для поиска
          </p>
        )}
      </Card>
    </div>
  );
}
