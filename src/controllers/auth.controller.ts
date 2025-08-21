// Controlador para autenticación
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getPool, sql } from '../db/db';
import { signToken } from '../auth/jwt.utils';

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: tecnico1
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       401:
 *         description: Credenciales inválidas
 */
export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string };

  const pool = await getPool();
  const result = await pool.request()
    .input('username', sql.NVarChar(50), username)
    .execute('dbo.sp_Usuarios_Login');

  const row = result.recordset?.[0];
  if (!row) return res.status(401).json({ message: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  const payload: Express.UserPayload = { id: row.id, username: row.username, role: row.role };
  const token = signToken(payload);

  res.json({ token, user: payload });
}

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       200:
 *         description: Token refrescado
 *       401:
 *         description: Token inválido
 */
export async function refreshToken(req: Request, res: Response) {
  // TODO: implementar lógica real de refresco
  return res.status(501).json({ message: 'No implementado' });
}
