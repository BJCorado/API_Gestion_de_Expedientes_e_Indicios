import { Request, Response } from 'express';
import { getPool, sql } from '../db/db';

// Helper: si es técnico, valida que sea dueño del expediente
async function assertOwnerIfTecnico(req: Request, expedienteId: number) {
  if (req.user?.role !== 'tecnico') return; // coordinador puede todo
  const pool = await getPool();
  const rs = await pool.request()
    .input('id', sql.Int, expedienteId)
    .query('SELECT tecnico_id FROM dbo.Expedientes WHERE id=@id AND activo=1');
  const row = rs.recordset[0];
  if (!row) {
    const err: any = new Error('Expediente no encontrado');
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
 * /expedientes:
 *   get:
 *     summary: Lista expedientes
 *     tags:
 *       - Expedientes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Cantidad por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado del expediente
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Código del expediente
 *     responses:
 *       200:
 *         description: Lista de expedientes
 */
export async function listarExpedientes(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const estado = (req.query.estado as string) || null;
  const codigo = (req.query.codigo as string) || null;
  // Si es técnico, filtramos por su id
  const tecnicoId = req.user?.role === 'tecnico' ? req.user.id : null;

  const pool = await getPool();
  const raw = await pool.request()
    .input('page', sql.Int, page)
    .input('pageSize', sql.Int, pageSize)
    .input('estado', sql.NVarChar(20), estado)
    .input('codigo', sql.NVarChar(50), codigo)
    .input('tecnico_id', sql.Int, tecnicoId)
    .execute('dbo.sp_Expedientes_Listar');

  // Tipamos el resultado como Procedimiento:
  const proc = raw as sql.IProcedureResult<any>;

  // recordsets[0] = filas; recordsets[1][0].total = total
  const recordsets = proc.recordsets as Array<any[]>;
  const rows = recordsets[0] ?? [];
  const total = recordsets[1]?.[0]?.total ?? 0;

  res.json({ data: rows, total, page, pageSize });

}

/**
 * @swagger
 * /expedientes/{id}:
 *   get:
 *     summary: Obtener expediente por ID
 *     tags:
 *       - Expedientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Detalle del expediente
 *       404:
 *         description: No encontrado
 *       403:
 *         description: No autorizado
 */
export async function obtenerExpediente(req: Request, res: Response) {
  const id = Number(req.params.id);
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .execute('dbo.sp_Expedientes_Obtener');

  const row = result.recordset[0];
  if (!row) return res.status(404).json({ message: 'No encontrado' });

  // Si es técnico, asegura que es suyo
  if (req.user?.role === 'tecnico' && row.tecnico_id !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  res.json(row);
}

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crear expediente
 *     tags:
 *       - Expedientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expediente creado
 */
export async function crearExpediente(req: Request, res: Response) {
  const { codigo, descripcion } = req.body as { codigo: string; descripcion: string };
  const tecnicoId = req.user!.id;

  const pool = await getPool();
  const result = await pool.request()
    .input('codigo', sql.NVarChar(50), codigo)
    .input('descripcion', sql.NVarChar(500), descripcion)
    .input('tecnico_id', sql.Int, tecnicoId)
    .execute('dbo.sp_Expedientes_Crear');

  res.status(201).json({ id: result.recordset[0].id, codigo, descripcion, tecnico_id: tecnicoId, estado: 'pendiente' });
}

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualizar expediente
 *     tags:
 *       - Expedientes
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
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expediente actualizado
 *       404:
 *         description: No encontrado
 *       403:
 *         description: No autorizado
 */
export async function actualizarExpediente(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { codigo, descripcion } = req.body as { codigo: string; descripcion: string };

  await assertOwnerIfTecnico(req, id);

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('codigo', sql.NVarChar(50), codigo)
    .input('descripcion', sql.NVarChar(500), descripcion)
    .execute('dbo.sp_Expedientes_Actualizar');

  if (!result.recordset[0]) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.recordset[0]);
}

/**
 * @swagger
 * /expedientes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de expediente (solo coordinador)
 *     tags:
 *       - Expedientes
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
 *               estado:
 *                 type: string
 *                 enum: [aprobado, rechazado]
 *               justificacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: No encontrado
 */
export async function cambiarEstadoExpediente(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { estado, justificacion } = req.body as { estado: 'aprobado' | 'rechazado'; justificacion?: string };

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nuevo_estado', sql.NVarChar(20), estado)
    .input('justificacion', sql.NVarChar(500), justificacion ?? null)
    .input('aprobador_id', sql.Int, req.user!.id)
    .execute('dbo.sp_Expedientes_CambiarEstado');

  if (!result.recordset[0]) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.recordset[0]);
}

/**
 * @swagger
 * /expedientes/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar expediente
 *     tags:
 *       - Expedientes
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
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de activación actualizado
 */
export async function activarDesactivarExpediente(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { activo } = req.body as { activo: boolean };

  await assertOwnerIfTecnico(req, id);

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('activo', sql.Bit, activo ? 1 : 0)
    .execute('dbo.sp_Expedientes_ActivarDesactivar');

  res.json(result.recordset[0]);
}

