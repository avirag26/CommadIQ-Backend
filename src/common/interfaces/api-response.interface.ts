export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiFailureResponse {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
}

export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiFailureResponse;
