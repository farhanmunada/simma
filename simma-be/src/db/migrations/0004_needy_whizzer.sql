CREATE TABLE "ppdb_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verification_notes" text,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "track" text DEFAULT 'reguler' NOT NULL;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "father_job" text;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "mother_job" text;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "tahfidz_juz_count" integer;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "achievement_notes" text;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "is_finalized" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ppdb_applicants" ADD COLUMN "finalized_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ppdb_documents" ADD CONSTRAINT "ppdb_documents_applicant_id_ppdb_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."ppdb_applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppdb_documents" ADD CONSTRAINT "ppdb_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;