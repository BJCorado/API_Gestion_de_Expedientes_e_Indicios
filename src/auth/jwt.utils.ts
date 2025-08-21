// Funciones utilitarias para manejo de JWT
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

const secret: Secret = env.JWT_SECRET as Secret;

export function signToken(payload: Express.UserPayload): string {
  // Acepta "3600" (segundos) o formatos tipo "1d", "12h"
  const raw = env.JWT_EXPIRES_IN ?? '1d';
  const expiresIn: SignOptions['expiresIn'] =
    /^\d+$/.test(String(raw)) ? Number(raw) : (raw as unknown as SignOptions['expiresIn']);

  const options: SignOptions = {
    expiresIn,
    algorithm: 'HS256',
  };

  // Aseguramos que sea 'object' para la sobrecarga correcta de jwt.sign
  return jwt.sign({ ...payload }, secret, options);
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, secret) as T;
}
