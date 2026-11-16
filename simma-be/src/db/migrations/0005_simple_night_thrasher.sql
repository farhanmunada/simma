CREATE TABLE "dispositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incoming_letter_id" uuid NOT NULL,
	"disposed_by" uuid NOT NULL,
	"target_user_id" uuid,
	"target_role" text NOT NULL,
	"urgency" text DEFAULT 'biasa' NOT NULL,
	"instruction" text DEFAULT 'tindak_lanjuti' NOT NULL,
	"notes" text,
	"deadline" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"follow_up_notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expedition_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outgoing_letter_id" uuid NOT NULL,
	"dispatch_date" date NOT NULL,
	"courier_name" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_proof" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agenda_number" integer NOT NULL,
	"year" integer NOT NULL,
	"mail_number" text NOT NULL,
	"sender" text NOT NULL,
	"mail_date" date NOT NULL,
	"received_date" date NOT NULL,
	"subject" text NOT NULL,
	"summary" text,
	"classification_code" text NOT NULL,
	"classification_id" uuid,
	"attachment_path" text,
	"attachment_name" text,
	"status" text DEFAULT 'waiting_disposition' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "letter_classifications_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "letter_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"security_degree" text DEFAULT 'B' NOT NULL,
	"last_sequence" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outgoing_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"letter_number" text NOT NULL,
	"security_degree" text DEFAULT 'B' NOT NULL,
	"sequence_number" integer NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"satker_code" text DEFAULT 'Ma.13.04' NOT NULL,
	"classification_code" text NOT NULL,
	"classification_id" uuid,
	"letter_date" date NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"signer_name" text NOT NULL,
	"signer_nip" text,
	"signer_role" text DEFAULT 'Kepala Madrasah' NOT NULL,
	"template_type" text DEFAULT 'custom' NOT NULL,
	"student_id" uuid,
	"teacher_id" uuid,
	"content_data" jsonb DEFAULT '{}'::jsonb,
	"verification_hash" text NOT NULL,
	"attachment_path" text,
	"status" text DEFAULT 'signed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outgoing_letters_letter_number_unique" UNIQUE("letter_number"),
	CONSTRAINT "outgoing_letters_verification_hash_unique" UNIQUE("verification_hash")
);
--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_incoming_letter_id_incoming_letters_id_fk" FOREIGN KEY ("incoming_letter_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_disposed_by_users_id_fk" FOREIGN KEY ("disposed_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expedition_books" ADD CONSTRAINT "expedition_books_outgoing_letter_id_outgoing_letters_id_fk" FOREIGN KEY ("outgoing_letter_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_classification_id_letter_classifications_id_fk" FOREIGN KEY ("classification_id") REFERENCES "public"."letter_classifications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_classification_id_letter_classifications_id_fk" FOREIGN KEY ("classification_id") REFERENCES "public"."letter_classifications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;