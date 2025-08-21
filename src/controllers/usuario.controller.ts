// Controlador para gestión de usuarios
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { getPool, sql } from '../db/db';

/**
 * @openapi
 * /usuarios:
 *   post:
 *     summary: Crear usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []           # requiere JWT en Swagger (Authorize)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: bj
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [tecnico, coordinador]
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos o username repetido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol coordinador
 *       500:
 *         description: Error del servidor
 */
export async function crearUsuario(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body as {
      username: string;
      password: string;
      role: 'tecnico' | 'coordinador';
    };

    // Validación básica adicional (además de requireFields)
    if (!['tecnico', 'coordinador'].includes(role)) {
      return res.status(400).json({ message: 'role inválido' });
    }

    // Hash de contraseña
    const hash = await bcrypt.hash(password, 10);

    const pool = await getPool();
    const result = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .input('password_hash', sql.NVarChar(255), hash)
      .input('role', sql.NVarChar(20), role)
      .execute('dbo.sp_Usuarios_Crear');

    // Asegúrate de que el SP retorne el id en recordset[0].id
    const id = result.recordset?.[0]?.id;

    return res.status(201).json({ id, username, role });
  } catch (err: any) {
    // Manejo de duplicados (unique key) típico de SQL Server
    const msg = String(err?.message || '').toLowerCase();
    const number = String((err as any)?.number || '');

    if (msg.includes('duplicate') || msg.includes('unique') || number === '2627' || number === '2601') {
      return res.status(400).json({ message: 'username ya existe' });
    }

    console.error('Error crearUsuario:', err);
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
}

/**
 * @openapi
 * /usuarios:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []          # requiere JWT (rol coordinador)
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Número de página (1-based)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: size
 *         description: Tamaño de página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         description: Búsqueda por nombre/usuario/rol
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listado paginado de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 23
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 size:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *             examples:
 *               ok:
 *                 value:
 *                   total: 23
 *                   page: 1
 *                   size: 10
 *                   data:
 *                     - id: 1001
 *                       username: "tecnico1"
 *                       rol: "tecnico"
 *                       activo: true
 *       401:
 *         description: No autenticado (Bearer ausente/ inválido)
 *       403:
 *         description: No autorizado (se requiere rol coordinador)
 *       500:
 *         description: Error del servidor
 */

export const listarUsuarios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pool = await getPool();

    const page   = parseInt((req.query.page as string) ?? '1', 10);
    const size   = parseInt((req.query.size as string) ?? '10', 10);
    const search = (req.query.search as string) ?? null;

    const result = await pool.request()
      .input('search', sql.NVarChar(100), search)
      .input('page', sql.Int, page)
      .input('size', sql.Int, size)
      .execute('dbo.sp_Usuarios_Listar');

    const row = result.recordset?.[0];
    const total = row?.total ?? 0;
    const dataJson = row?.data_json ?? '[]';
    const data = JSON.parse(dataJson); // array de usuarios sin password_hash

    res.json({
      total,
      page,
      size,
      data,
    });
  } catch (err) {
    next(err);
  }
};