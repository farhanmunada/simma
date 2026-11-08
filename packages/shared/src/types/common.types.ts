/** Standard paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Standard API error response */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/** Standard API success response (single item) */
export interface ApiResponse<T> {
  data: T;
}
