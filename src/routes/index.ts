// Definición de rutas principales
import { Router } from 'express';
import authRoutes from './auth.routes';
import expedienteRoutes from './expediente.routes';
import indicioRoutes from './indicio.routes';
import usuarioRoutes from "./usuario.routes";
const router = Router();
router.use('/auth', authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use('/', indicioRoutes);        // define primero porque tiene prefijo /expedientes/...
router.use('/expedientes', expedienteRoutes);


export default router;
