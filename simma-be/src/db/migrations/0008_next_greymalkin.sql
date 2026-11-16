CREATE TABLE "extracurricular_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extracurricular_member_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester" text NOT NULL,
	"score" text NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extracurricular_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extracurricular_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"joined_date" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extracurriculars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"coach_id" uuid,
	"schedule_day" text,
	"schedule_time" text,
	"venue" text,
	"max_capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "extracurriculars_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facility_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"condition" text DEFAULT 'BAIK' NOT NULL,
	"location" text,
	"purchase_date" text,
	"source_of_fund" text,
	"qr_code_token" text NOT NULL,
	"status" text DEFAULT 'TERSEDIA' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facility_assets_code_unique" UNIQUE("code"),
	CONSTRAINT "facility_assets_qr_code_token_unique" UNIQUE("qr_code_token")
);
--> statement-breakpoint
CREATE TABLE "facility_loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"borrower_name" text NOT NULL,
	"borrower_type" text NOT NULL,
	"loan_date" text NOT NULL,
	"due_date" text NOT NULL,
	"return_date" text,
	"status" text DEFAULT 'DIPINJAM' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_maintenance_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"reporter_id" uuid,
	"reporter_name" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text DEFAULT 'SEDANG' NOT NULL,
	"status" text DEFAULT 'MENUNGGU' NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_graduations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"classroom_id" uuid,
	"graduation_status" text DEFAULT 'lulus' NOT NULL,
	"graduation_date" date NOT NULL,
	"certificate_number" text,
	"skl_number" text,
	"notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"reference_number" text NOT NULL,
	"student_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"transfer_date" date NOT NULL,
	"destination_school" text,
	"reason" text,
	"approval_notes" text,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"verification_code" text,
	"origin_school" text,
	"origin_letter_number" text,
	"origin_npsn" text,
	"previous_class_level" integer DEFAULT 10,
	"target_classroom_id" uuid,
	"stambuk_number" text,
	"notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_transfers_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "transfer_clearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"library_cleared" boolean DEFAULT false NOT NULL,
	"library_cleared_by_id" uuid,
	"library_cleared_at" timestamp with time zone,
	"library_notes" text,
	"finance_cleared" boolean DEFAULT false NOT NULL,
	"finance_cleared_by_id" uuid,
	"finance_cleared_at" timestamp with time zone,
	"finance_notes" text,
	"discipline_cleared" boolean DEFAULT false NOT NULL,
	"discipline_cleared_by_id" uuid,
	"discipline_cleared_at" timestamp with time zone,
	"discipline_notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "extracurricular_grades" ADD CONSTRAINT "extracurricular_grades_extracurricular_member_id_extracurricular_members_id_fk" FOREIGN KEY ("extracurricular_member_id") REFERENCES "public"."extracurricular_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracurricular_grades" ADD CONSTRAINT "extracurricular_grades_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracurricular_members" ADD CONSTRAINT "extracurricular_members_extracurricular_id_extracurriculars_id_fk" FOREIGN KEY ("extracurricular_id") REFERENCES "public"."extracurriculars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracurricular_members" ADD CONSTRAINT "extracurricular_members_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracurricular_members" ADD CONSTRAINT "extracurricular_members_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracurriculars" ADD CONSTRAINT "extracurriculars_coach_id_teachers_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_loans" ADD CONSTRAINT "facility_loans_asset_id_facility_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."facility_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_maintenance_tickets" ADD CONSTRAINT "facility_maintenance_tickets_asset_id_facility_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."facility_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_maintenance_tickets" ADD CONSTRAINT "facility_maintenance_tickets_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_target_classroom_id_classrooms_id_fk" FOREIGN KEY ("target_classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_clearances" ADD CONSTRAINT "transfer_clearances_transfer_id_student_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."student_transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_clearances" ADD CONSTRAINT "transfer_clearances_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_clearances" ADD CONSTRAINT "transfer_clearances_library_cleared_by_id_users_id_fk" FOREIGN KEY ("library_cleared_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_clearances" ADD CONSTRAINT "transfer_clearances_finance_cleared_by_id_users_id_fk" FOREIGN KEY ("finance_cleared_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_clearances" ADD CONSTRAINT "transfer_clearances_discipline_cleared_by_id_users_id_fk" FOREIGN KEY ("discipline_cleared_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "extracurricular_grades_member_idx" ON "extracurricular_grades" USING btree ("extracurricular_member_id");--> statement-breakpoint
CREATE INDEX "extracurricular_grades_period_idx" ON "extracurricular_grades" USING btree ("academic_year_id","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "extracurricular_grades_unique_idx" ON "extracurricular_grades" USING btree ("extracurricular_member_id","academic_year_id","semester");--> statement-breakpoint
CREATE INDEX "extracurricular_members_student_idx" ON "extracurricular_members" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "extracurricular_members_ekskul_idx" ON "extracurricular_members" USING btree ("extracurricular_id");--> statement-breakpoint
CREATE INDEX "extracurricular_members_period_idx" ON "extracurricular_members" USING btree ("academic_year_id","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "extracurricular_members_unique_idx" ON "extracurricular_members" USING btree ("extracurricular_id","student_id","academic_year_id","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "extracurriculars_code_idx" ON "extracurriculars" USING btree ("code");--> statement-breakpoint
CREATE INDEX "extracurriculars_category_idx" ON "extracurriculars" USING btree ("category");--> statement-breakpoint
CREATE INDEX "extracurriculars_coach_idx" ON "extracurriculars" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "extracurriculars_is_active_idx" ON "extracurriculars" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "facility_assets_code_idx" ON "facility_assets" USING btree ("code");--> statement-breakpoint
CREATE INDEX "facility_assets_category_idx" ON "facility_assets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "facility_assets_status_idx" ON "facility_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "facility_assets_qr_idx" ON "facility_assets" USING btree ("qr_code_token");--> statement-breakpoint
CREATE INDEX "facility_loans_asset_idx" ON "facility_loans" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "facility_loans_status_idx" ON "facility_loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "facility_loans_date_idx" ON "facility_loans" USING btree ("loan_date");--> statement-breakpoint
CREATE INDEX "facility_tickets_asset_idx" ON "facility_maintenance_tickets" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "facility_tickets_status_idx" ON "facility_maintenance_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "facility_tickets_priority_idx" ON "facility_maintenance_tickets" USING btree ("priority");--> statement-breakpoint
CREATE UNIQUE INDEX "student_graduations_year_student_idx" ON "student_graduations" USING btree ("academic_year_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_transfers_ref_idx" ON "student_transfers" USING btree ("reference_number");