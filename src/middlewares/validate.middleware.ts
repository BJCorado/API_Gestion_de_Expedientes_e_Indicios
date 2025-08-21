// Middleware para validación de datos
import { Request, Response, NextFunction } from 'express';
export function requireFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const f of fields) {
      if (req.body[f] === undefined || req.body[f] === null || req.body[f] === '')
        return res.status(400).json({ message: `El campo '${f}' es obligatorio` });
    }
    next();
  };
}
