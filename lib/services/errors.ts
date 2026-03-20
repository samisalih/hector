export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'TIMER_ALREADY_RUNNING'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
