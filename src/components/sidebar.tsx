"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Главная", icon: "🏠" },
  { href: "/dashboard/facilities", label: "Объекты", icon: "🏭" },
  { href: "/dashboard/reports", label: "Отчёты", icon: "📋" },
  { href: "/dashboard/calendar", label: "Сроки", icon: "📅" },
  { href: "/dashboard/reference", label: "Справочники", icon: "📚" },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-green-700">ЭкоОтчёт</span>
        <p className="text-xs text-gray-400 mt-0.5">Экологическая отчетность</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            ].join(" ")}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 text-xs text-gray-400">
        2-ТП · ПЭК · НВОС
      </div>
    </aside>
  );
}
