// Rutas para autenticación
import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { requireFields } from '../middlewares/validate.middleware';
const router = Router();
router.post('/login', requireFields(['username','password']), login);
export default router;
