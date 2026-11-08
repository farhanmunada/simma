import { z } from "zod";

export * from "@simma/shared";

export const IdParamSchema = z.object({
  id: z.string().uuid("ID format must be a valid UUID"),
});

export type IdParamInput = z.infer<typeof IdParamSchema>;
