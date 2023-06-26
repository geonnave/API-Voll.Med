import { StatusCodes as Status } from 'http-status-codes'
import { logger } from '../logger.js'

class AppError extends Error {
  private readonly _message: string
  private readonly _statusCode: number

  constructor (message: string, statusCode?: number, error?: any) {
    super()
    this._message = message
    this._statusCode = statusCode ?? Status.BAD_REQUEST

    if (error != null) {
      logger.error({error: error}, message)
    } else {
      logger.error(message)
    }
  }

  getMessage (): string {
    return this._message
  }

  getStatusCode (): number {
    return this._statusCode
  }
}

export {
  AppError,
  Status
}
