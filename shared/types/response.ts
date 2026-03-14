export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponsePagination<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface APIResponseSuccess<T = any> {
  message: string;
  data?: T;
}

export interface APIResponseError {
  statusCode: number;
  message: string;
  data?: any;
}
