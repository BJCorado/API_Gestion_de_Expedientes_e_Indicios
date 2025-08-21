// Rutas para gestión de usuarios
import { Router } from 'express';
import { crearUsuario, listarUsuarios } from '../controllers/usuario.controller';
import { requireFields } from '../middlewares/validate.middleware';
import { authenticate } from '../auth/auth.middleware';
import { requireRole } from '../auth/role.middleware';
const router = Router();
// GET /api/usuarios  (solo coordinador)
router.get('/',
  authenticate,
  requireRole('coordinador'),
  listarUsuarios
);

// POST /api/usuarios  (solo coordinador)
router.post('/',
  authenticate,
  requireRole('coordinador'),
  requireFields(['username','password','role']),
  crearUsuario
);

export default router;
