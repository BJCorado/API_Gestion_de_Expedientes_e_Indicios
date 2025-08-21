import { Router } from 'express';
import {
  listarExpedientes,
  obtenerExpediente,
  crearExpediente,
  actualizarExpediente,
  cambiarEstadoExpediente,
  activarDesactivarExpediente
} from '../controllers/expediente.controller';
import { authenticate } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';

const router = Router();

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
 *         description: Página
 *     responses:
 *       200:
 *         description: Lista de expedientes
 */
router.get('/', authenticate, listarExpedientes);
router.get('/:id', authenticate, obtenerExpediente);

router.post('/',
  authenticate, requireRole('tecnico'),
  requireFields(['codigo','descripcion']),
  crearExpediente
);

router.put('/:id',
  authenticate,
  requireFields(['codigo','descripcion']),
  actualizarExpediente
);

router.patch('/:id/estado',
  authenticate, requireRole('coordinador'),
  requireFields(['estado']),
  cambiarEstadoExpediente
);

router.patch('/:id/activo',
  authenticate,
  requireFields(['activo']),
  activarDesactivarExpediente
);

export default router;
