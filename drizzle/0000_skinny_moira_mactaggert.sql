CREATE TYPE "public"."hazard_class" AS ENUM('I', 'II', 'III', 'IV', 'V');--> statement-breakpoint
CREATE TYPE "public"."nvos_category" AS ENUM('I', 'II', 'III', 'IV');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'validated', 'submitted');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('2tp_waste', '2tp_air', '2tp_water');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"resource" varchar(50) NOT NULL,
	"resource_id" integer,
	"details" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deadlines" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" "report_type" NOT NULL,
	"deadline_date" date NOT NULL,
	"description" text NOT NULL,
	"nvos_categories" jsonb NOT NULL,
	"year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"nvos_category" "nvos_category" NOT NULL,
	"nvos_reg_number" varchar(50),
	"okved" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"report_id" integer,
	"deadline_id" integer,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"inn" varchar(12) NOT NULL,
	"kpp" varchar(9),
	"ogrn" varchar(15),
	"legal_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pollutant_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"cas_number" varchar(20),
	"hazard_class" "hazard_class",
	"pdk_mr" numeric(12, 6),
	"pdk_ss" numeric(12, 6),
	"unit" varchar(20) DEFAULT 'mg/m3'
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"type" "report_type" NOT NULL,
	"year" integer NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"data" jsonb,
	"validation_errors" jsonb,
	"pdf_url" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255),
	"org_id" integer,
	"role" "user_role" DEFAULT 'owner' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waste_classifiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"hazard_class" "hazard_class" NOT NULL,
	"parent_code" varchar(20)
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_resource_idx" ON "audit_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "deadline_year_idx" ON "deadlines" USING btree ("year");--> statement-breakpoint
CREATE INDEX "facility_org_idx" ON "facilities" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_unread_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE UNIQUE INDEX "org_inn_idx" ON "organizations" USING btree ("inn");--> statement-breakpoint
CREATE UNIQUE INDEX "pollutant_code_idx" ON "pollutant_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "pollutant_name_search_idx" ON "pollutant_codes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "report_facility_idx" ON "reports" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "report_type_year_idx" ON "reports" USING btree ("facility_id","type","year");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "waste_code_idx" ON "waste_classifiers" USING btree ("code");--> statement-breakpoint
CREATE INDEX "waste_name_search_idx" ON "waste_classifiers" USING btree ("name");