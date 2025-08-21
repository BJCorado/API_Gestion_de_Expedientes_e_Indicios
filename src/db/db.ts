// Configuración y conexión a la base de datos
import sql from 'mssql';
import { env } from '../config/env';

const sqlConfig: sql.config = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  server: env.DB_SERVER,
  database: env.DB_DATABASE,
  options: { encrypt: env.DB_ENCRYPT, trustServerCertificate: true }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) return pool;
  pool = await sql.connect(sqlConfig);
  return pool;
}
export { sql };
