/** Shared API envelope types. See docs/API_CONTRACT.md. */
export interface PageMeta { page: number; pageSize: number; total: number; totalPages: number }
export interface Paginated<T> { data: T[]; meta: PageMeta }
export interface Single<T> { data: T }
export interface Option { value: string; label: string }
export interface ApiErrorBody { message: string; errors?: Record<string, string> }

export type SortOrder = "asc" | "desc";
export interface ListParams {
  page?: number; pageSize?: number; q?: string; sort?: string; order?: SortOrder;
  [filter: string]: string | number | boolean | undefined;
}
