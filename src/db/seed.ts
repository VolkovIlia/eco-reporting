import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { wasteClassifiers, pollutantCodes, deadlines } from "./schema";

const WASTE_CLASSIFIERS = [
  { code: "01 00 000 00 00 0", name: "Отходы, связанные с добычей металлических руд", hazardClass: "V" as const, parentCode: null },
  { code: "02 00 000 00 00 0", name: "Отходы химических производств и производств, смежных с ними", hazardClass: "II" as const, parentCode: null },
  { code: "03 00 000 00 00 0", name: "Отходы обрабатывающих производств", hazardClass: "IV" as const, parentCode: null },
  { code: "04 00 000 00 00 0", name: "Отходы потребления производственные и непроизводственные", hazardClass: "IV" as const, parentCode: null },
  { code: "07 01 010 01 30 5", name: "Мусор от бытовых помещений организаций", hazardClass: "V" as const, parentCode: "07 00 000 00 00 0" },
  { code: "07 02 999 00 00 5", name: "Прочие отходы потребления на производстве, аналогичные коммунальным", hazardClass: "V" as const, parentCode: "07 00 000 00 00 0" },
  { code: "3 91 100 00 40 5", name: "Лом незагрязненного металла черного", hazardClass: "V" as const, parentCode: null },
  { code: "3 91 200 00 40 5", name: "Лом незагрязненного металла цветного", hazardClass: "V" as const, parentCode: null },
  { code: "7 33 120 01 72 5", name: "Отходы (осадки) при механической и биологической очистке сточных вод", hazardClass: "V" as const, parentCode: null },
  { code: "4 06 100 00 40 4", name: "Золошлаковая смесь от сжигания углей IV класса опасности", hazardClass: "IV" as const, parentCode: null },
];

const POLLUTANT_CODES = [
  { code: "0001", name: "Взвешенные вещества", casNumber: null, hazardClass: "III" as const, pdkMr: "0.500", pdkSs: "0.150", unit: "мг/м3" },
  { code: "0143", name: "Марганец и его соединения", casNumber: "7439-96-5", hazardClass: "II" as const, pdkMr: "0.010", pdkSs: "0.001", unit: "мг/м3" },
  { code: "0301", name: "Диоксид азота", casNumber: "10102-44-0", hazardClass: "II" as const, pdkMr: "0.200", pdkSs: "0.040", unit: "мг/м3" },
  { code: "0330", name: "Диоксид серы", casNumber: "7446-09-5", hazardClass: "III" as const, pdkMr: "0.500", pdkSs: "0.050", unit: "мг/м3" },
  { code: "0337", name: "Оксид углерода", casNumber: "630-08-0", hazardClass: "IV" as const, pdkMr: "5.000", pdkSs: "3.000", unit: "мг/м3" },
  { code: "0703", name: "Бенз(а)пирен", casNumber: "50-32-8", hazardClass: "I" as const, pdkMr: "0.000001", pdkSs: "0.000001", unit: "мг/м3" },
  { code: "2902", name: "Взвешенные частицы PM2.5", casNumber: null, hazardClass: "II" as const, pdkMr: "0.160", pdkSs: "0.035", unit: "мг/м3" },
  { code: "2930", name: "Взвешенные частицы PM10", casNumber: null, hazardClass: "III" as const, pdkMr: "0.300", pdkSs: "0.060", unit: "мг/м3" },
];

const CURRENT_YEAR = new Date().getFullYear();

const DEADLINES = [
  {
    reportType: "2tp_waste" as const,
    deadlineDate: `${CURRENT_YEAR}-02-01`,
    description: "Сдача 2-ТП Отходы за предыдущий год (категории I-IV НВОС)",
    nvosCategories: ["I", "II", "III", "IV"],
    year: CURRENT_YEAR,
  },
  {
    reportType: "2tp_air" as const,
    deadlineDate: `${CURRENT_YEAR}-01-22`,
    description: "Сдача 2-ТП Воздух за предыдущий год",
    nvosCategories: ["I", "II"],
    year: CURRENT_YEAR,
  },
  {
    reportType: "2tp_water" as const,
    deadlineDate: `${CURRENT_YEAR}-01-22`,
    description: "Сдача 2-ТП Водхоз за предыдущий год",
    nvosCategories: ["I", "II", "III"],
    year: CURRENT_YEAR,
  },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log("Seeding waste classifiers...");
  await db.insert(wasteClassifiers).values(
    WASTE_CLASSIFIERS.map(w => ({
      code: w.code,
      name: w.name,
      hazardClass: w.hazardClass,
      parentCode: w.parentCode ?? undefined,
    }))
  ).onConflictDoNothing();

  console.log("Seeding pollutant codes...");
  await db.insert(pollutantCodes).values(
    POLLUTANT_CODES.map(p => ({
      code: p.code,
      name: p.name,
      casNumber: p.casNumber ?? undefined,
      hazardClass: p.hazardClass,
      pdkMr: p.pdkMr,
      pdkSs: p.pdkSs,
      unit: p.unit,
    }))
  ).onConflictDoNothing();

  console.log("Seeding deadlines...");
  await db.insert(deadlines).values(DEADLINES).onConflictDoNothing();

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
