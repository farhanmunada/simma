CREATE TABLE "dispensation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"academic_year_id" uuid,
	"amount" integer NOT NULL,
	"grade_level" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fee_items_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "mutabaah_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"target_count" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'kali' NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"gender_specific" text DEFAULT 'all' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mutabaah_daily_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'terlaksana' NOT NULL,
	"volume" integer DEFAULT 1 NOT NULL,
	"score" integer DEFAULT 100 NOT NULL,
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mutabaah_uzur_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"uzur_type" text DEFAULT 'haidh' NOT NULL,
	"notes" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p5ra_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"predicate" text NOT NULL,
	"notes" text,
	"assessed_by" uuid,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p5ra_project_classrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"classroom_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p5ra_project_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"element" text NOT NULL,
	"sub_element" text NOT NULL,
	"target_description" text NOT NULL,
	"value_pra" text NOT NULL,
	"sub_value_pra" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p5ra_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"title" text NOT NULL,
	"theme" text NOT NULL,
	"description" text NOT NULL,
	"target_fase" text DEFAULT 'E' NOT NULL,
	"coordinator_teacher_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"start_date" text,
	"end_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p5ra_student_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"process_notes" text NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transaction_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" text NOT NULL,
	"student_id" uuid NOT NULL,
	"cashier_id" uuid,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"payment_method" text DEFAULT 'tunai' NOT NULL,
	"total_amount" integer NOT NULL,
	"received_amount" integer NOT NULL,
	"change_amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"notes" text,
	"void_reason" text,
	"voided_at" timestamp with time zone,
	"voided_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "schedule_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"capacity" integer DEFAULT 36 NOT NULL,
	"location" text,
	"room_type" text DEFAULT 'teori' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "schedule_time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"session_type" text DEFAULT 'formal' NOT NULL,
	"day_of_week" text NOT NULL,
	"period_order" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_teaching_time" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"classroom_id" uuid NOT NULL,
	"subject_id" uuid,
	"teacher_id" uuid,
	"room_id" uuid,
	"room_name" text,
	"day_of_week" text NOT NULL,
	"time_slot_id" uuid NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"student_id" uuid NOT NULL,
	"fee_item_id" uuid NOT NULL,
	"classroom_id" uuid,
	"month" integer,
	"year" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"remaining_amount" integer NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"due_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "teacher_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"document_number" text,
	"issue_date" date,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text DEFAULT 'application/pdf',
	"verification_status" text DEFAULT 'verified' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"level" text NOT NULL,
	"institution" text NOT NULL,
	"major" text NOT NULL,
	"graduation_year" integer NOT NULL,
	"gpa" text,
	"certificate_number" text,
	"is_linear" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"nip" text,
	"peg_id" text,
	"nrg" text,
	"no_kk" text,
	"birth_place" text,
	"birth_date" date,
	"gender" text,
	"religion" text DEFAULT 'Islam' NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"marriage_status" text,
	"tmt_first" date,
	"tmt_pns" date,
	"duty_status" text DEFAULT 'aktif' NOT NULL,
	"gtk_type" text DEFAULT 'pendidik' NOT NULL,
	"certification_field" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_profiles_teacher_id_unique" UNIQUE("teacher_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_ranks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"rank" text NOT NULL,
	"grade_group" text NOT NULL,
	"sk_number" text NOT NULL,
	"sk_date" date NOT NULL,
	"tmt_rank" date NOT NULL,
	"salary" integer,
	"next_promotion_date" date,
	"next_kgb_date" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_workloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"teaching_jtm" integer DEFAULT 0 NOT NULL,
	"additional_duty_type" text DEFAULT 'tidak_ada',
	"additional_duty_jtm" integer DEFAULT 0 NOT NULL,
	"total_jtm" integer DEFAULT 0 NOT NULL,
	"is_eligible_tpg" boolean DEFAULT false NOT NULL,
	"simpatika_status" text DEFAULT 'layak' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dispensation_requests" ADD CONSTRAINT "dispensation_requests_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_requests" ADD CONSTRAINT "dispensation_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_items" ADD CONSTRAINT "fee_items_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutabaah_daily_entries" ADD CONSTRAINT "mutabaah_daily_entries_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutabaah_daily_entries" ADD CONSTRAINT "mutabaah_daily_entries_activity_id_mutabaah_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."mutabaah_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutabaah_daily_entries" ADD CONSTRAINT "mutabaah_daily_entries_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutabaah_uzur_records" ADD CONSTRAINT "mutabaah_uzur_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutabaah_uzur_records" ADD CONSTRAINT "mutabaah_uzur_records_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_assessments" ADD CONSTRAINT "p5ra_assessments_project_id_p5ra_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."p5ra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_assessments" ADD CONSTRAINT "p5ra_assessments_target_id_p5ra_project_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."p5ra_project_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_assessments" ADD CONSTRAINT "p5ra_assessments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_assessments" ADD CONSTRAINT "p5ra_assessments_assessed_by_users_id_fk" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_project_classrooms" ADD CONSTRAINT "p5ra_project_classrooms_project_id_p5ra_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."p5ra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_project_classrooms" ADD CONSTRAINT "p5ra_project_classrooms_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_project_targets" ADD CONSTRAINT "p5ra_project_targets_project_id_p5ra_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."p5ra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_projects" ADD CONSTRAINT "p5ra_projects_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_projects" ADD CONSTRAINT "p5ra_projects_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_projects" ADD CONSTRAINT "p5ra_projects_coordinator_teacher_id_teachers_id_fk" FOREIGN KEY ("coordinator_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_student_notes" ADD CONSTRAINT "p5ra_student_notes_project_id_p5ra_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."p5ra_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_student_notes" ADD CONSTRAINT "p5ra_student_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p5ra_student_notes" ADD CONSTRAINT "p5ra_student_notes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction_items" ADD CONSTRAINT "payment_transaction_items_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction_items" ADD CONSTRAINT "payment_transaction_items_invoice_id_student_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."student_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_room_id_schedule_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."schedule_rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_time_slot_id_schedule_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."schedule_time_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_fee_item_id_fee_items_id_fk" FOREIGN KEY ("fee_item_id") REFERENCES "public"."fee_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_documents" ADD CONSTRAINT "teacher_documents_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_education" ADD CONSTRAINT "teacher_education_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_ranks" ADD CONSTRAINT "teacher_ranks_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_workloads" ADD CONSTRAINT "teacher_workloads_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_workloads" ADD CONSTRAINT "teacher_workloads_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_workloads" ADD CONSTRAINT "teacher_workloads_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mutabaah_daily_entries_student_activity_date_idx" ON "mutabaah_daily_entries" USING btree ("student_id","activity_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "p5ra_assessments_proj_target_student_idx" ON "p5ra_assessments" USING btree ("project_id","target_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "p5ra_proj_cls_idx" ON "p5ra_project_classrooms" USING btree ("project_id","classroom_id");--> statement-breakpoint
CREATE UNIQUE INDEX "p5ra_student_notes_proj_student_idx" ON "p5ra_student_notes" USING btree ("project_id","student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_time_slots_day_order_idx" ON "schedule_time_slots" USING btree ("day_of_week","period_order");--> statement-breakpoint
CREATE INDEX "schedule_time_slots_day_idx" ON "schedule_time_slots" USING btree ("day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "schedules_classroom_slot_unique_idx" ON "schedules" USING btree ("semester_id","classroom_id","day_of_week","time_slot_id");--> statement-breakpoint
CREATE INDEX "schedules_semester_classroom_idx" ON "schedules" USING btree ("semester_id","classroom_id");--> statement-breakpoint
CREATE INDEX "schedules_semester_teacher_idx" ON "schedules" USING btree ("semester_id","teacher_id");--> statement-breakpoint
CREATE INDEX "schedules_semester_room_idx" ON "schedules" USING btree ("semester_id","room_id");--> statement-breakpoint
CREATE INDEX "schedules_day_slot_idx" ON "schedules" USING btree ("day_of_week","time_slot_id");