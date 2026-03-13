import Link from "next/link";

const FEATURES = [
  {
    icon: "📋",
    title: "2-ТП Отходы",
    desc: "Автоматический контроль баланса. Встроенный справочник ФККО.",
  },
  {
    icon: "💨",
    title: "2-ТП Воздух",
    desc: "Учёт выбросов загрязняющих веществ в атмосферу.",
  },
  {
    icon: "💧",
    title: "2-ТП Водхоз",
    desc: "Отчётность по забору и сбросу водных ресурсов.",
  },
  {
    icon: "📅",
    title: "Контроль сроков",
    desc: "Уведомления о приближающихся сроках сдачи отчётности.",
  },
  {
    icon: "🏭",
    title: "Несколько объектов",
    desc: "Ведите отчётность по всем объектам НВОС в одном месте.",
  },
  {
    icon: "📄",
    title: "Экспорт PDF",
    desc: "Готовые формы для Росприроднадзора в один клик.",
  },
];

const PRICING = [
  {
    name: "Базовый",
    price: "1 900 ₽/мес",
    features: ["1 объект НВОС", "Все формы 2-ТП", "PDF экспорт", "Email поддержка"],
    cta: "Начать бесплатно",
    highlight: false,
  },
  {
    name: "Бизнес",
    price: "4 900 ₽/мес",
    features: ["До 10 объектов", "Все формы 2-ТП + ПЭК", "PDF экспорт", "Приоритетная поддержка", "API доступ"],
    cta: "Выбрать тариф",
    highlight: true,
  },
  {
    name: "Корпоративный",
    price: "По запросу",
    features: ["Неограниченно объектов", "Все формы", "Интеграция с 1С", "Выделенный менеджер"],
    cta: "Связаться",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-xl font-bold text-green-700">ЭкоОтчёт</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Войти
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Попробовать бесплатно
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
          <span>🌿</span> Соответствует требованиям Приказа № 757 от 26.12.2024
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Экологическая отчётность<br />без ошибок и просрочек
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Автоматизируем подготовку 2-ТП, ПЭК и НВОС для российских предприятий.
          Контроль сроков, проверка балансов, экспорт в Росприроднадзор.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-green-600 text-white rounded-lg text-base font-semibold hover:bg-green-700 transition-colors"
          >
            Начать бесплатно
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            Войти
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Всё для экологической отчётности
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-lg p-6 border border-gray-200">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Тарифы</h2>
        <div className="grid grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-lg border p-8 flex flex-col",
                plan.highlight
                  ? "border-green-500 shadow-lg shadow-green-100"
                  : "border-gray-200",
              ].join(" ")}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded self-start mb-4">
                  Популярный
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2 mb-6">{plan.price}</p>
              <ul className="space-y-2 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={[
                  "text-center px-6 py-3 rounded-lg text-sm font-semibold transition-colors",
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
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} ЭкоОтчёт. Все права защищены.</p>
        <p className="mt-1">Соответствие требованиям Росприроднадзора · 2-ТП · ПЭК · НВОС</p>
      </footer>
    </div>
  );
}
