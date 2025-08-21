 import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger'; // 👈 importamos el spec real

const app = express();

app.use(cors());
app.use(express.json());

// Monta Swagger primero
console.log(">>> Montando Swagger en /docs");
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Monta las rutas
app.use('/api',routes);

//Manejador de errores al final
app.use(errorHandler);

export default app;
