import { Router } from 'express';
import {
  listarIndiciosPorExpediente,
  crearIndicio,
  actualizarIndicio,
  activarDesactivarIndicio
} from '../controllers/indicio.controller';
import { authenticate } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
import { requireFields } from '../middlewares/validate.middleware';

const router = Router();

router.get('/expedientes/:id/indicios', authenticate, listarIndiciosPorExpediente);

router.post('/expedientes/:id/indicios',
  authenticate, requireRole('tecnico'),
  requireFields(['descripcion','peso']),
  crearIndicio
);

router.put('/indicios/:id',
  authenticate,
  requireFields(['descripcion','peso']),
  actualizarIndicio
);

router.patch('/indicios/:id/activo',
  authenticate,
  requireFields(['activo']),
  activarDesactivarIndicio
);

export default router;
