// Configuración de variables de entorno
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 3000),
  DB_SERVER: process.env.DB_SERVER || 'sqlserver',
  DB_USER: process.env.DB_USER || 'sa',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'GestionExpedientes',
  DB_ENCRYPT: (process.env.DB_ENCRYPT || 'false') === 'true',
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
};
