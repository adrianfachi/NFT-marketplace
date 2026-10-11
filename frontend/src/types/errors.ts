export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string>
  retryable: boolean
  status?: number
}
