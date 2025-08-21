// Inicialización del servidor
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
  console.log(`Swagger en      http://localhost:${env.PORT}/docs`);
});
