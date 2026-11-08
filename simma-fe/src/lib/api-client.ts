import { useAuthStore } from "../stores/auth.store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  responseType?: "json" | "blob";
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, responseType = "json", ...customConfig } = options;
  const token = useAuthStore.getState().token;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers: Record<string, string> = {
    Accept: responseType === "blob" ? "application/pdf, application/octet-stream, */*" : "application/json",
    ...(customConfig.body && !(customConfig.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(customConfig.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...customConfig,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError("Sesi Anda telah berakhir. Silakan masuk kembali.", 401);
  }

  if (!response.ok) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let errorData: unknown;
    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null) {
        const errorObj = errorData as { message?: string; error?: string };
        errorMessage = errorObj.message || errorObj.error || errorMessage;
      }
    } catch {
      // response was not JSON
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (responseType === "blob") {
    return (await response.blob()) as unknown as T;
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  // If response is already wrapped in { success, data }
  if (result && typeof result === "object" && "data" in result && "success" in result) {
    return result.data as T;
  }
  return result as T;
}
