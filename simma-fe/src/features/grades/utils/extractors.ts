import type { PaginatedResult } from "../types";

export function extractList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (Array.isArray(payload.data)) return payload.data as T[];
  }
  return [];
}

export function extractSingle<T>(res: unknown): T {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data as T;
    }
  }
  return res as T;
}

export function extractPaginated<T>(res: unknown): PaginatedResult<T> {
  if (Array.isArray(res)) {
    return {
      data: res,
      meta: { page: 1, limit: res.length, total: res.length, totalPages: 1 },
    };
  }
  if (res && typeof res === "object") {
    const obj = res as { data?: unknown; meta?: PaginatedResult<T>["meta"] };
    const list = Array.isArray(obj.data) ? (obj.data as T[]) : [];
    return {
      data: list,
      meta: obj.meta,
    };
  }
  return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
}
