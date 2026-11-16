import { z } from "zod";
export {
  emisAuditQuerySchema,
  emisExportQuerySchema,
  emisBapCreateSchema,
  emisBapApprovalSchema,
  emisExportTypeSchema,
  emisExportFormatSchema,
  emisBapStatusSchema,
} from "@simma/shared";
export type {
  EmisAuditQuery,
  EmisExportQuery,
  EmisBapCreateInput,
  EmisBapApprovalInput,
} from "@simma/shared";

export const bapIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type BapIdParam = z.infer<typeof bapIdParamSchema>;
