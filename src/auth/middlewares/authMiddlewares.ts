/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import jwt from 'jsonwebtoken'
import { AppError, Status } from '../../error/ErrorHandler.js'
import { type Role } from '../roles'
import { access, refresh } from '../tokens.js'

function verificaTokenJWT (...role: Role[]) {
  return async (req, res, next): Promise<any> => {
    if (!req.headers.authorization) { throw new AppError('Nenhum token informado.', Status.FORBIDDEN) }

    const tokenString: string[] = req.headers.authorization.split(' ')
    const token = tokenString[1]

    // Nenhuma token informado
    if (!token) {
      throw new AppError('Nenhum token informado', Status.FORBIDDEN)
    }
    // Verifica se o token é válido
    await access.verifica(token)

    // Verifica se o token é válido
    jwt.verify(token, process.env.SECRET_JWT, function (err, decoded) {
      if (err) {
        req.log.error({token: token, note: 'expired'}, 'Falha de autenticação: token expirou')
        throw new AppError('Falha ao autenticar o token. Token expirou', Status.FORBIDDEN, {token: token, note: 'expired'})
      }

      if (role.length > 0 && !role.includes(decoded.role)) {
        throw new AppError('Não autorizado', Status.FORBIDDEN, {role: role, note: 'invalid'})
      }

      req.userId = decoded.id
      req.userRole = decoded.role
      next()
    })
  }
}

async function refreshMiddleware () {
  return async (req, _, next): Promise<void> => {
    const { refreshToken } = req.body
    const id = await refresh.verifica(refreshToken)
    req.userId = id
    await refresh.invalida(refreshToken)
    return next()
  }
}

export { verificaTokenJWT, refreshMiddleware }
