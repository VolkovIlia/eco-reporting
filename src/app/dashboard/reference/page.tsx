"use client";

import { useState } from "react";
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

const HAZARD_LABELS: Record<string, string> = {
  I: "I кл. — чрезвычайно опасные",
  II: "II кл. — высокоопасные",
  III: "III кл. — умеренно опасные",
  IV: "IV кл. — малоопасные",
  V: "V кл. — практически неопасные",
};

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

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

  function switchTab(t: "waste" | "pollutants") {
    setTab(t);
    setResults([]);
    setSearched(false);
    setQuery("");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>
        <p className="text-sm text-gray-500 mt-0.5">ФККО и перечень загрязняющих веществ для форм 2-ТП</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => switchTab("waste")}
          className={[
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            tab === "waste"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          ФККО (отходы)
        </button>
        <button
          onClick={() => switchTab("pollutants")}
          className={[
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            tab === "pollutants"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          Загрязняющие вещества
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  tab === "waste"
                    ? "Поиск по коду ФККО или названию отхода..."
                    : "Поиск по коду, названию вещества или CAS..."
                }
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={query.length < 2 || loading}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Поиск..." : "Найти"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Введите минимум 2 символа для поиска</p>
        </div>

        {/* Results */}
        <div className="divide-y divide-gray-50">
          {searched && results.length === 0 && !loading && (
            <div className="py-10 text-center">
              <p className="text-gray-500 text-sm">По запросу «{query}» ничего не найдено</p>
              <p className="text-gray-400 text-xs mt-1">Попробуйте другой запрос или код</p>
            </div>
          )}

          {!searched && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-400">
                <SearchIcon />
              </div>
              <p className="text-gray-500 text-sm">
                {tab === "waste"
                  ? "Поиск по Федеральному классификационному каталогу отходов"
                  : "Поиск по перечню загрязняющих веществ для форм 2-ТП Воздух"}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50">
                <p className="text-xs text-gray-500">Найдено: {results.length} записей</p>
              </div>
              {tab === "waste" && (results as WasteItem[]).map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <Badge variant={HAZARD_VARIANTS[item.hazardClass] ?? "default"}>
                    Класс {item.hazardClass}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 mb-0.5">{item.code}</p>
                    <p className="text-sm text-gray-900">{item.name}</p>
                    {HAZARD_LABELS[item.hazardClass] && (
                      <p className="text-xs text-gray-400 mt-0.5">{HAZARD_LABELS[item.hazardClass]}</p>
                    )}
                  </div>
                </div>
              ))}
              {tab === "pollutants" && (results as PollutantItem[]).map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                  {item.hazardClass ? (
                    <Badge variant={HAZARD_VARIANTS[item.hazardClass] ?? "default"}>
                      Класс {item.hazardClass}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-300 font-medium mt-0.5 w-16 shrink-0">—</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 mb-0.5">{item.code}</p>
                    <p className="text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Ед. изм.: {item.unit}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
