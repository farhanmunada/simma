CREATE TABLE "counseling_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"counselor_id" uuid NOT NULL,
	"session_date" text NOT NULL,
	"session_type" text DEFAULT 'individual' NOT NULL,
	"issue_category" text NOT NULL,
	"problem_description" text NOT NULL,
	"counseling_notes" text,
	"action_plan" text,
	"status" text DEFAULT 'dijadwalkan' NOT NULL,
	"follow_up_date" text,
	"is_confidential" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discipline_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'infraction' NOT NULL,
	"category" text NOT NULL,
	"points" integer NOT NULL,
	"description" text,
	"sanction" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discipline_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "parent_summons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"letter_number" text NOT NULL,
	"student_id" uuid NOT NULL,
	"parent_name" text NOT NULL,
	"summon_date" text NOT NULL,
	"summon_time" text NOT NULL,
	"location" text NOT NULL,
	"reason" text NOT NULL,
	"sanction_level" text DEFAULT 'sp_1' NOT NULL,
	"status" text DEFAULT 'terbit' NOT NULL,
	"notes" text,
	"issued_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parent_summons_letter_number_unique" UNIQUE("letter_number")
);
--> statement-breakpoint
CREATE TABLE "student_infractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"rule_id" uuid,
	"date" text NOT NULL,
	"type" text DEFAULT 'infraction' NOT NULL,
	"category" text NOT NULL,
	"points" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"witness" text,
	"evidence_url" text,
	"reporter_id" uuid,
	"status" text DEFAULT 'approved' NOT NULL,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_summons" ADD CONSTRAINT "parent_summons_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_summons" ADD CONSTRAINT "parent_summons_issued_by_id_users_id_fk" FOREIGN KEY ("issued_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_infractions" ADD CONSTRAINT "student_infractions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_infractions" ADD CONSTRAINT "student_infractions_rule_id_discipline_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."discipline_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_infractions" ADD CONSTRAINT "student_infractions_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_infractions" ADD CONSTRAINT "student_infractions_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "counseling_sessions_student_idx" ON "counseling_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "counseling_sessions_counselor_idx" ON "counseling_sessions" USING btree ("counselor_id");--> statement-breakpoint
CREATE INDEX "counseling_sessions_status_idx" ON "counseling_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "discipline_rules_type_idx" ON "discipline_rules" USING btree ("type");--> statement-breakpoint
CREATE INDEX "discipline_rules_category_idx" ON "discipline_rules" USING btree ("category");--> statement-breakpoint
CREATE INDEX "parent_summons_student_idx" ON "parent_summons" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "parent_summons_date_idx" ON "parent_summons" USING btree ("summon_date");--> statement-breakpoint
CREATE INDEX "parent_summons_status_idx" ON "parent_summons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "student_infractions_student_idx" ON "student_infractions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_infractions_date_idx" ON "student_infractions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "student_infractions_status_idx" ON "student_infractions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "student_infractions_type_idx" ON "student_infractions" USING btree ("type");