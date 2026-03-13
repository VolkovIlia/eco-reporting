import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums ---

export const userRoleEnum = pgEnum("user_role", ["owner", "editor", "viewer"]);

export const nvosCategoryEnum = pgEnum("nvos_category", ["I", "II", "III", "IV"]);

export const reportTypeEnum = pgEnum("report_type", [
  "2tp_waste",
  "2tp_air",
  "2tp_water",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "validated",
  "submitted",
]);

export const hazardClassEnum = pgEnum("hazard_class", [
  "I",
  "II",
  "III",
  "IV",
  "V",
]);

// --- Users & Organizations ---

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  inn: varchar("inn", { length: 12 }).notNull(),
  kpp: varchar("kpp", { length: 9 }),
  ogrn: varchar("ogrn", { length: 15 }),
  legalAddress: text("legal_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("org_inn_idx").on(t.inn),
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  orgId: integer("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  role: userRoleEnum("role").default("owner").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("user_email_idx").on(t.email),
]);

// --- Facilities (production sites) ---

export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  nvosCategory: nvosCategoryEnum("nvos_category").notNull(),
  nvosRegNumber: varchar("nvos_reg_number", { length: 50 }),
  okved: varchar("okved", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("facility_org_idx").on(t.orgId),
]);

// --- Reports ---

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id")
    .references(() => facilities.id, { onDelete: "cascade" })
    .notNull(),
  type: reportTypeEnum("type").notNull(),
  year: integer("year").notNull(),
  status: reportStatusEnum("status").default("draft").notNull(),
  data: jsonb("data"),
  validationErrors: jsonb("validation_errors"),
  pdfUrl: varchar("pdf_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("report_facility_idx").on(t.facilityId),
  index("report_type_year_idx").on(t.facilityId, t.type, t.year),
]);

// --- Reference Data: FKKO Waste Classifier ---

export const wasteClassifiers = pgTable("waste_classifiers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  name: text("name").notNull(),
  hazardClass: hazardClassEnum("hazard_class").notNull(),
  parentCode: varchar("parent_code", { length: 20 }),
}, (t) => [
  uniqueIndex("waste_code_idx").on(t.code),
  index("waste_name_search_idx").on(t.name),
]);

// --- Reference Data: Pollutant Codes ---

export const pollutantCodes = pgTable("pollutant_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull(),
  name: text("name").notNull(),
  casNumber: varchar("cas_number", { length: 20 }),
  hazardClass: hazardClassEnum("hazard_class"),
  pdkMr: numeric("pdk_mr", { precision: 12, scale: 6 }),
  pdkSs: numeric("pdk_ss", { precision: 12, scale: 6 }),
  unit: varchar("unit", { length: 20 }).default("mg/m3"),
}, (t) => [
  uniqueIndex("pollutant_code_idx").on(t.code),
  index("pollutant_name_search_idx").on(t.name),
]);

// --- Deadlines ---

export const deadlines = pgTable("deadlines", {
  id: serial("id").primaryKey(),
  reportType: reportTypeEnum("report_type").notNull(),
  deadlineDate: date("deadline_date").notNull(),
  description: text("description").notNull(),
  nvosCategories: jsonb("nvos_categories").notNull(),
  year: integer("year").notNull(),
}, (t) => [
  index("deadline_year_idx").on(t.year),
]);

// --- Notifications ---

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" }),
  deadlineId: integer("deadline_id")
    .references(() => deadlines.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("notification_user_idx").on(t.userId),
  index("notification_unread_idx").on(t.userId, t.read),
]);

// --- Audit Log ---

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("audit_user_idx").on(t.userId),
  index("audit_resource_idx").on(t.resource, t.resourceId),
]);

// --- Sessions (NextAuth) ---

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (t) => [
  uniqueIndex("session_token_idx").on(t.sessionToken),
]);

// --- Relations ---

export const organizationRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  facilities: many(facilities),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  notifications: many(notifications),
}));

export const facilityRelations = relations(facilities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [facilities.orgId],
    references: [organizations.id],
  }),
  reports: many(reports),
}));

export const reportRelations = relations(reports, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [reports.facilityId],
    references: [facilities.id],
  }),
  notifications: many(notifications),
}));
