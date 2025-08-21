import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const isProd = process.env.NODE_ENV === 'production';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestión de Expedientes',
      version: '1.0.0',
      description: 'Documentación de la API de gestión de expedientes e indicios',
    },
    servers: [ { url: 'http://localhost:3000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // En dev lee .ts, en prod lee .js
  apis: isProd
    ? ['dist/routes/**/*.js', 'dist/controllers/**/*.js']
    : ['src/routes/**/*.ts', 'src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function mountSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
