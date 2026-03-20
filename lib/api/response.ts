import { NextResponse } from 'next/server'
import { ServiceError } from '@/lib/services/errors'

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status })
}

export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null }, { status: 201 })
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    data,
    error: null,
    meta: { total, page, limit },
  })
}

export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status })
}

export function unauthorizedResponse(): NextResponse {
  return errorResponse('Nicht autorisiert', 401)
}

export function serviceErrorResponse(err: unknown): NextResponse {
  if (err instanceof ServiceError) {
    switch (err.code) {
      case 'NOT_FOUND':
        return errorResponse(err.message, 404)
      case 'FORBIDDEN':
        return errorResponse(err.message, 403)
      case 'TIMER_ALREADY_RUNNING':
        return errorResponse(err.message, 409)
      case 'CONFLICT':
        return errorResponse(err.message, 409)
      default:
        return errorResponse(err.message, 500)
    }
  }
  console.error(err)
  return errorResponse('Interner Serverfehler', 500)
}
