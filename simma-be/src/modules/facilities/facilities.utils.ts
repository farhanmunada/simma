import { randomBytes } from "node:crypto";

export function generateQrCodeToken(prefix = "AST"): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}
