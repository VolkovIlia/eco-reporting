import Link from "next/link";

const STATS = [
  { value: "2 000+", label: "предприятий в РФ используют форму" },
  { value: "300 000 ₽", label: "максимальный штраф за просрочку" },
  { value: "22 янв.", label: "ближайший дедлайн 2-ТП Отходы" },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "2-ТП Отходы",
    desc: "Автоматический контроль баланса образования и движения отходов. Встроенный справочник ФККО.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    ),
    title: "2-ТП Воздух",
    desc: "Учёт выбросов загрязняющих веществ в атмосферу. Все категории объектов НВОС.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      </svg>
    ),
    title: "2-ТП Водхоз",
    desc: "Отчётность по забору и сбросу водных ресурсов. Соответствие требованиям Росводресурсов.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "ПЭК (план)",
    desc: "Программа производственного экологического контроля. Учёт мероприятий и результатов.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M8 18h.01" />
      </svg>
    ),
    title: "Контроль сроков",
    desc: "Уведомления о приближающихся дедлайнах. Никаких штрафов за просрочку.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      </svg>
    ),
    title: "Несколько объектов",
    desc: "Ведите отчётность по всем объектам НВОС в одном месте. Без переключения между системами.",
  },
];

const PRICING = [
  {
    name: "Стартовый",
    price: "3 000",
    period: "₽/мес",
    features: [
      "1 объект НВОС",
      "Все формы 2-ТП",
      "PDF экспорт",
      "Контроль сроков",
      "Email поддержка",
    ],
    cta: "Начать бесплатно",
    highlight: false,
    note: "14 дней бесплатно",
  },
  {
    name: "Бизнес",
    price: "5 000",
    period: "₽/мес",
    features: [
      "До 10 объектов НВОС",
      "Все формы 2-ТП + ПЭК",
      "PDF экспорт",
      "Контроль сроков",
      "Приоритетная поддержка",
      "API доступ",
    ],
    cta: "Выбрать тариф",
    highlight: true,
    note: "Самый популярный",
  },
  {
    name: "Корпоративный",
    price: "12 000",
    period: "₽/мес",
    features: [
      "Неограниченно объектов",
      "Все формы 2-ТП + ПЭК + НВОС",
      "Интеграция с 1С",
      "Выделенный менеджер",
      "Обучение персонала",
      "SLA 4 часа",
    ],
    cta: "Связаться с нами",
    highlight: false,
    note: "Для холдингов",
  },
];

const DEADLINES = [
  { date: "22 января", label: "2-ТП Отходы", urgency: "red" },
  { date: "22 января", label: "2-ТП Воздух", urgency: "red" },
  { date: "22 января", label: "2-ТП Водхоз", urgency: "red" },
  { date: "1 марта", label: "ПЭК-отчёт", urgency: "yellow" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">ЭкоОтчёт</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Попробовать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl">
            {/* Compliance badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Соответствует Приказу № 757 от 26.12.2024
            </div>

            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              Экологическая отчётность<br />
              <span className="text-green-600">без ошибок и просрочек</span>
            </h1>

            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Автоматизируем подготовку 2-ТП, ПЭК и НВОС для российских предприятий.
              Контроль сроков, проверка балансов, экспорт в Росприроднадзор.
            </p>

            {/* Urgency block */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-8 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <span className="font-semibold text-amber-800">Важно для вашего предприятия:</span>
                <span className="text-amber-700"> штраф за непредоставление 2-ТП — до 300 000 ₽.
                Ближайший дедлайн: 22 января — 2-ТП Отходы, Воздух, Водхоз.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition-colors"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors"
              >
                Войти
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-2">14 дней бесплатно · Без привязки карты</p>
          </div>

          {/* Deadline widget */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-gray-900 px-4 py-3">
                <p className="text-white text-xs font-semibold uppercase tracking-wider">Дедлайны 2026</p>
              </div>
              <div className="divide-y divide-gray-100">
                {DEADLINES.map((d) => (
                  <div key={d.label} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.label}</p>
                      <p className="text-xs text-gray-500">{d.date}</p>
                    </div>
                    <span className={[
                      "text-xs font-semibold px-2 py-0.5 rounded",
                      d.urgency === "red" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                    ].join(" ")}>
                      {d.urgency === "red" ? "Просрочено" : "Скоро"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-green-50 border-t border-green-100">
                <p className="text-xs text-green-700 font-medium text-center">
                  ЭкоОтчёт напомнит за 30, 14 и 7 дней
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Все формы отчётности в одном месте</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Подготовка и сдача отчётности в Росприроднадзор по всем требуемым формам
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-14 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Как это работает</h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { n: "1", title: "Добавьте объект", desc: "Укажите данные объекта НВОС: название, адрес, категорию, рег. номер." },
              { n: "2", title: "Заполните форму", desc: "Пошаговый мастер с подсказками и встроенными справочниками ФККО." },
              { n: "3", title: "Проверка баланса", desc: "Система автоматически проверяет корректность данных и балансы." },
              { n: "4", title: "Экспорт в PDF", desc: "Готовый документ для загрузки в систему Росприроднадзора." },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-base font-bold mx-auto mb-3">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Тарифы</h2>
          <p className="text-gray-500">Начните бесплатно, платите только когда убедитесь в пользе</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-xl border p-7 flex flex-col relative",
                plan.highlight
                  ? "border-green-500 shadow-lg shadow-green-100 bg-white"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Популярный
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{plan.note}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={[
                  "text-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  plan.highlight
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center">
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} ЭкоОтчёт. Все права защищены.</p>
        <p className="text-xs text-gray-400 mt-1">
          Соответствие требованиям Росприроднадзора · 2-ТП · ПЭК · НВОС · Приказ № 757 от 26.12.2024
        </p>
      </footer>
    </div>
  );
}
