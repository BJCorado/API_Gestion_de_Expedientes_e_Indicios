// Definición del modelo de Usuario
export interface Usuario {
  id: number;
  username: string;
  role: 'tecnico' | 'coordinador';
  password_hash?: string;
  activo: boolean;
}
