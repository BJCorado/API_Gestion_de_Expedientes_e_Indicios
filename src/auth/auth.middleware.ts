// Middleware para autenticación de usuarios
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.utils';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Token requerido' });
  try {
    const token = auth.split(' ')[1];
    req.user = verifyToken<Express.UserPayload>(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
