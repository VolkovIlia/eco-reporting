/**
 * Seed script: reference data for eco-reporting
 * Run: npx tsx src/db/seed.ts
 *
 * Idempotent: uses onConflictDoNothing on unique columns
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { wasteClassifiers, pollutantCodes, deadlines } from "./schema";

// --- Types ---

type HazardClass = "I" | "II" | "III" | "IV" | "V";
type ReportType = "2tp_waste" | "2tp_air" | "2tp_water";

type WasteRow = {
  code: string;
  name: string;
  hazardClass: HazardClass;
  parentCode?: string;
};

type PollutantRow = {
  code: string;
  name: string;
  casNumber?: string;
  hazardClass?: HazardClass;
  pdkMr?: string;
  pdkSs?: string;
  unit?: string;
};

type DeadlineRow = {
  reportType: ReportType;
  deadlineDate: string;
  description: string;
  nvosCategories: string[];
  year: number;
};

// --- ФККО waste codes ---

const WASTE_CODES: WasteRow[] = [
  // Top-level categories
  {
    code: "1 00 000 00 00 0",
    name: "Отходы сельского, лесного хозяйства, рыбоводства и рыболовства",
    hazardClass: "V",
  },
  {
    code: "2 00 000 00 00 0",
    name: "Отходы добычи полезных ископаемых",
    hazardClass: "V",
  },
  {
    code: "3 00 000 00 00 0",
    name: "Отходы обрабатывающих производств",
    hazardClass: "V",
  },
  {
    code: "4 00 000 00 00 0",
    name: "Отходы потребления населением, подобные коммунальным",
    hazardClass: "V",
  },
  {
    code: "7 00 000 00 00 0",
    name: "Отходы при строительстве, сносе, ремонте и разборке",
    hazardClass: "V",
  },
  // Common specific codes
  {
    code: "4 01 010 01 00 0",
    name: "Отходы бумаги и картона от резки и правки",
    hazardClass: "V",
    parentCode: "4 00 000 00 00 0",
  },
  {
    code: "4 02 010 01 00 0",
    name: "Отходы из полиэтилена в виде пленки",
    hazardClass: "V",
    parentCode: "4 00 000 00 00 0",
  },
  {
    code: "4 03 010 01 00 0",
    name: "Покрышки с металлическим кордом отработанные",
    hazardClass: "IV",
    parentCode: "4 00 000 00 00 0",
  },
  {
    code: "4 05 010 01 00 0",
    name: "Пищевые отходы от организаций общественного питания",
    hazardClass: "V",
    parentCode: "4 00 000 00 00 0",
  },
  {
    code: "7 33 100 01 72 4",
    name: "Мусор строительный от разборки зданий",
    hazardClass: "IV",
    parentCode: "7 00 000 00 00 0",
  },
];

// --- Atmospheric pollutants (загрязняющие вещества) ---

const POLLUTANTS: PollutantRow[] = [
  {
    code: "0301",
    name: "Азота диоксид (NO\u2082)",
    casNumber: "10102-44-0",
    hazardClass: "III",
    pdkMr: "0.200000",
    pdkSs: "0.040000",
    unit: "mg/m3",
  },
  {
    code: "0304",
    name: "Азота оксид (NO)",
    casNumber: "10102-43-9",
    hazardClass: "III",
    pdkMr: "0.400000",
    pdkSs: "0.060000",
    unit: "mg/m3",
  },
  {
    code: "0330",
    name: "Серы диоксид (SO\u2082)",
    casNumber: "7446-09-5",
    hazardClass: "III",
    pdkMr: "0.500000",
    pdkSs: "0.050000",
    unit: "mg/m3",
  },
  {
    code: "0337",
    name: "Углерода оксид (CO)",
    casNumber: "630-08-0",
    hazardClass: "IV",
    pdkMr: "5.000000",
    pdkSs: "3.000000",
    unit: "mg/m3",
  },
  {
    code: "0703",
    name: "Бенз(а)пирен",
    casNumber: "50-32-8",
    hazardClass: "I",
    pdkMr: "0.000001",
    pdkSs: "0.000001",
    unit: "mg/m3",
  },
  {
    code: "2902",
    name: "Взвешенные вещества",
    hazardClass: "III",
    pdkMr: "0.500000",
    pdkSs: "0.150000",
    unit: "mg/m3",
  },
  {
    code: "2908",
    name: "Пыль неорганическая (до 20% SiO\u2082)",
    hazardClass: "III",
    pdkMr: "0.500000",
    pdkSs: "0.150000",
    unit: "mg/m3",
  },
  {
    code: "1325",
    name: "Формальдегид",
    casNumber: "50-00-0",
    hazardClass: "II",
    pdkMr: "0.050000",
    pdkSs: "0.010000",
    unit: "mg/m3",
  },
  {
    code: "0410",
    name: "Метан",
    casNumber: "74-82-8",
    hazardClass: "V",
    unit: "mg/m3",
  },
  {
    code: "1071",
    name: "Фенол",
    casNumber: "108-95-2",
    hazardClass: "II",
    pdkMr: "0.010000",
    pdkSs: "0.003000",
    unit: "mg/m3",
  },
];

// --- Reporting deadlines for 2026-2027 cycle ---
// NOTE: ПЭК, Декларация НВОС, Расчёт экосбора use separate submission
// channels (not covered by reportTypeEnum) so only 2-ТП forms are seeded here.

const DEADLINES_2026: DeadlineRow[] = [
  {
    reportType: "2tp_waste",
    deadlineDate: "2026-01-22",
    description: "2-ТП (отходы) за 2025 год",
    nvosCategories: ["I", "II", "III", "IV"],
    year: 2026,
  },
  {
    reportType: "2tp_air",
    deadlineDate: "2026-01-22",
    description: "2-ТП (воздух) за 2025 год",
    nvosCategories: ["I", "II", "III"],
    year: 2026,
  },
  {
    reportType: "2tp_water",
    deadlineDate: "2026-01-22",
    description: "2-ТП (водхоз) за 2025 год",
    nvosCategories: ["I", "II", "III"],
    year: 2026,
  },
];

const DEADLINES_2027: DeadlineRow[] = [
  {
    reportType: "2tp_waste",
    deadlineDate: "2027-01-22",
    description: "2-ТП (отходы) за 2026 год",
    nvosCategories: ["I", "II", "III", "IV"],
    year: 2027,
  },
  {
    reportType: "2tp_air",
    deadlineDate: "2027-01-22",
    description: "2-ТП (воздух) за 2026 год",
    nvosCategories: ["I", "II", "III"],
    year: 2027,
  },
  {
    reportType: "2tp_water",
    deadlineDate: "2027-01-22",
    description: "2-ТП (водхоз) за 2026 год",
    nvosCategories: ["I", "II", "III"],
    year: 2027,
  },
];

// --- Seed helpers ---

async function seedWasteCodes(db: ReturnType<typeof drizzle>): Promise<void> {
  for (const row of WASTE_CODES) {
    await db
      .insert(wasteClassifiers)
      .values(row)
      .onConflictDoNothing({ target: wasteClassifiers.code });
  }
  console.log(`Seeded ${WASTE_CODES.length} ФККО waste codes`);
}

async function seedPollutants(db: ReturnType<typeof drizzle>): Promise<void> {
  for (const row of POLLUTANTS) {
    await db
      .insert(pollutantCodes)
      .values(row)
      .onConflictDoNothing({ target: pollutantCodes.code });
  }
  console.log(`Seeded ${POLLUTANTS.length} pollutant codes`);
}

async function seedDeadlines(db: ReturnType<typeof drizzle>): Promise<void> {
  const all = [...DEADLINES_2026, ...DEADLINES_2027];
  for (const row of all) {
    await db.insert(deadlines).values(row).onConflictDoNothing();
  }
  console.log(`Seeded ${all.length} deadline entries`);
}

// --- Entry point ---

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log("Starting seed...");
  await seedWasteCodes(db);
  await seedPollutants(db);
  await seedDeadlines(db);
  console.log("Seed complete.");

  await client.end();
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
