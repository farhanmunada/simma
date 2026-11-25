CREATE TABLE "teacher_classroom_scopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"classroom_id" uuid NOT NULL,
	"scope_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_subject_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"classroom_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "employee_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "secondary_roles" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher_classroom_scopes" ADD CONSTRAINT "teacher_classroom_scopes_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_classroom_scopes" ADD CONSTRAINT "teacher_classroom_scopes_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_classroom_scopes" ADD CONSTRAINT "teacher_classroom_scopes_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subject_assignments" ADD CONSTRAINT "teacher_subject_assignments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_classroom_scopes_unique_idx" ON "teacher_classroom_scopes" USING btree ("teacher_id","semester_id","classroom_id","scope_type");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_subject_assignments_unique_idx" ON "teacher_subject_assignments" USING btree ("teacher_id","semester_id","classroom_id","subject_id");--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_employee_code_unique" UNIQUE("employee_code");