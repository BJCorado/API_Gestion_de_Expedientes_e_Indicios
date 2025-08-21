// Definición del modelo de Expediente
export interface Expediente {
  id: number;
  codigo: string;
  descripcion: string;
  fecha_registro?: string;
  tecnico_id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  justificacion?: string | null;
  aprobador_id?: number | null;
  fecha_estado?: string | null;
  activo: boolean;
}
