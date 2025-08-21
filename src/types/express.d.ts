// Extensiones de tipos para Express
export {};
declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      username: string;
      role: 'tecnico' | 'coordinador';
    }
    interface Request { user?: UserPayload; }
  }
}
