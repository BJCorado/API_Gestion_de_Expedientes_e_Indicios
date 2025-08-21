import { Request, Response } from 'express';
import { getPool, sql } from '../db/db';

// helper: validar dueño del indicio si es técnico
async function assertIndicioOwnerIfTecnico(req: Request, indicioId: number) {
  if (req.user?.role !== 'tecnico') return;
  const pool = await getPool();
  const rs = await pool.request()
    .input('id', sql.Int, indicioId)
    .query('SELECT tecnico_id FROM dbo.Indicios WHERE id=@id AND activo=1');
  const row = rs.recordset[0];
  if (!row) {
    const err: any = new Error('Indicio no encontrado');
    err.status = 404;
    throw err;
  }
  if (row.tecnico_id !== req.user!.id) {
    const err: any = new Error('No autorizado (no eres el técnico asignado)');
    err.status = 403;
    throw err;
  }
}

/**
 * @swagger
 * /expedientes/{id}/indicios:
 *   get:
 *     summary: Listar indicios por expediente
 *     tags:
 *       - Indicios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Lista de indicios
 *       404:
 *         description: Expediente no encontrado
 *       403:
 *         description: No autorizado
 */
// GET /expedientes/:id/indicios
export async function listarIndiciosPorExpediente(req: Request, res: Response) {
  const expedienteId = Number(req.params.id);
  // si es técnico, verifica que el expediente sea suyo
  if (req.user?.role === 'tecnico') {
    const pool = await getPool();
    const rs = await pool.request()
      .input('id', sql.Int, expedienteId)
      .query('SELECT tecnico_id FROM dbo.Expedientes WHERE id=@id AND activo=1');
    const row = rs.recordset[0];
    if (!row) return res.status(404).json({ message: 'Expediente no encontrado' });
    if (row.tecnico_id !== req.user.id) return res.status(403).json({ message: 'No autorizado' });
  }

  const pool = await getPool();
  const result = await pool.request()
    .input('expediente_id', sql.Int, expedienteId)
    .execute('dbo.sp_Indicios_ListarPorExpediente');

  res.json(result.recordset);
}

/**
 * @swagger
 * /expedientes/{id}/indicios:
 *   post:
 *     summary: Crear indicio en expediente
 *     tags:
 *       - Indicios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               color:
 *                 type: string
 *               tamano:
 *                 type: string
 *               peso:
 *                 type: number
 *               ubicacion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Indicio creado
 *       404:
 *         description: Expediente no encontrado
 *       403:
 *         description: No autorizado
 */
// POST /expedientes/:id/indicios
export async function crearIndicio(req: Request, res: Response) {
  const expedienteId = Number(req.params.id);
  const { descripcion, color, tamano, peso, ubicacion } = req.body as any;

  // si es técnico, debe ser dueño del expediente
  if (req.user?.role === 'tecnico') {
    const pool = await getPool();
    const rs = await pool.request()
      .input('id', sql.Int, expedienteId)
      .query('SELECT tecnico_id FROM dbo.Expedientes WHERE id=@id AND activo=1');
    const row = rs.recordset[0];
    if (!row) return res.status(404).json({ message: 'Expediente no encontrado' });
    if (row.tecnico_id !== req.user.id) return res.status(403).json({ message: 'No autorizado' });
  }

  const pool = await getPool();
  const result = await pool.request()
    .input('expediente_id', sql.Int, expedienteId)
    .input('descripcion', sql.NVarChar(500), descripcion)
    .input('color', sql.NVarChar(50), color ?? null)
    .input('tamano', sql.NVarChar(50), tamano ?? null)
    .input('peso', sql.Decimal(10,2), peso)
    .input('ubicacion', sql.NVarChar(100), ubicacion ?? null)
    .input('tecnico_id', sql.Int, req.user!.id)
    .execute('dbo.sp_Indicios_Crear');

  res.status(201).json({ id: result.recordset[0].id, expediente_id: expedienteId, descripcion, peso });
}

/**
 * @swagger
 * /indicios/{id}:
 *   put:
 *     summary: Actualizar indicio
 *     tags:
 *       - Indicios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               color:
 *                 type: string
 *               tamano:
 *                 type: string
 *               peso:
 *                 type: number
 *               ubicacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Indicio actualizado
 *       404:
 *         description: No encontrado
 *       403:
 *         description: No autorizado
 */
// PUT /indicios/:id
export async function actualizarIndicio(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { descripcion, color, tamano, peso, ubicacion } = req.body as any;

  await assertIndicioOwnerIfTecnico(req, id);

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('descripcion', sql.NVarChar(500), descripcion)
    .input('color', sql.NVarChar(50), color ?? null)
    .input('tamano', sql.NVarChar(50), tamano ?? null)
    .input('peso', sql.Decimal(10,2), peso)
    .input('ubicacion', sql.NVarChar(100), ubicacion ?? null)
    .execute('dbo.sp_Indicios_Actualizar');

  if (!result.recordset[0]) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.recordset[0]);
}

/**
 * @swagger
 * /indicios/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar indicio
 *     tags:
 *       - Indicios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de activación actualizado
 *       404:
 *         description: No encontrado
 *       403:
 *         description: No autorizado
 */
// PATCH /indicios/:id/activo
export async function activarDesactivarIndicio(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { activo } = req.body as { activo: boolean };

  await assertIndicioOwnerIfTecnico(req, id);

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('activo', sql.Bit, activo ? 1 : 0)
    .execute('dbo.sp_Indicios_ActivarDesactivar');

  res.json(result.recordset[0]);
}
