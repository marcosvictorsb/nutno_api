export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requestId?: string;
  pagination?: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}
