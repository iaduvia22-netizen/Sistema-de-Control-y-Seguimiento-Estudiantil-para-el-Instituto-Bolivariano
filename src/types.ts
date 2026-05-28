/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. Roles del Sistema
export type RoleId = 'admin' | 'coordinador' | 'docente' | 'acudiente';

export interface Rol {
  id_rol: RoleId;
  nombre_rol: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Permiso {
  id_permiso: string;
  nombre_permiso: string;
  descripcion: string;
}

export interface RolPermiso {
  id_rol: RoleId;
  id_permiso: string;
}

// 2. Usuarios
export interface Usuario {
  id_usuario: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  password_hash: string; // Representativo
  rol_id: RoleId;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  ultimo_acceso: string;
}

// 3. Grados o Cursos
export interface Grado {
  id_grado: string;
  nombre_grado: string; // Ej: "11°-A", "Ciclo V"
  grupo: string; // "A", "B", "Sábado"
  jornada: string; // "Mañana", "Tarde", "Sábado"
  director_grupo_id: string; // id_usuario (docente)
  estado: 'Activo' | 'Inactivo';
}

// 4. Estudiantes
export interface Estudiante {
  id_estudiante: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  grado_id: string; // id_grado
  jornada: string;
  estado: 'Activo' | 'Inactivo' | 'Retirado';
  fecha_ingreso: string;
  avatar_url?: string;
}

// 5. Relación Estudiante - Acudiente
export interface EstudianteAcudiente {
  id_estudiante: string;
  id_acudiente: string; // id_usuario
  parentesco: 'Madre' | 'Padre' | 'Tío/a' | 'Abuelo/a' | 'Acudiente General';
  es_principal: boolean;
  recibe_notificaciones: boolean;
}

// 6. Asistencia
export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tarde' | 'Excusado' | 'Retirado';

export interface Asistencia {
  id_asistencia: string;
  id_estudiante: string;
  id_docente: string;
  id_grado: string;
  fecha: string; // YYYY-MM-DD
  hora_registro: string; // HH:mm:ss
  estado_asistencia: EstadoAsistencia;
  observacion: string;
  registrado_por: string; // Nombre completo
  fecha_creacion: string;
}

// 7. Observaciones Disciplinarias o Convivenciales
export type TipoObservacion = 'Académica' | 'Disciplinaria' | 'Convivencial' | 'Reconocimiento positivo' | 'Seguimiento general';
export type NivelGravedad = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface Observacion {
  id_observacion: string;
  id_estudiante: string;
  id_docente: string;
  tipo_observacion: TipoObservacion;
  categoria: string; // Ej: "Inasistencia injustificada", "Excelente desempeño", "Interrupción de clase"
  descripcion: string;
  nivel_gravedad: NivelGravedad;
  fecha_observacion: string;
  estado: 'Vigente' | 'Cerrado';
  registrado_por: string; // Nombres y apellidos
  fecha_creacion: string;
}

// 8. Notificaciones
export type CanalNotificacion = 'Correo electrónico' | 'WhatsApp' | 'Panel web';
export type EstadoEnvio = 'Pendiente' | 'Enviada' | 'Fallida' | 'Leída' | 'Confirmada';

export interface Notificacion {
  id_notificacion: string;
  id_estudiante: string;
  id_acudiente: string; // id_usuario (acudiente)
  tipo_notificacion: 'Asistencia' | 'Disciplinaria' | 'Circular' | 'Alerta Crítica';
  canal: CanalNotificacion;
  asunto: string;
  mensaje: string;
  estado_envio: EstadoEnvio;
  fecha_envio: string;
  fecha_lectura: string | null;
}

// 9. Confirmación de Lectura de Acudiente
export interface Confirmacion {
  id_confirmacion: string;
  id_notificacion: string;
  id_acudiente: string;
  fecha_confirmacion: string;
  comentario_acudiente: string;
  ip_confirmacion: string;
}

// 10. Auditoría del Sistema
export interface Auditoria {
  id_auditoria: string;
  id_usuario: string;
  usuario_nombre: string;
  usuario_rol: RoleId;
  accion: string; // Ej: "Registrar asistencia", "Crear examen"
  modulo: string; // "Asistencias", "Observaciones", "Usuarios", "Configuración"
  descripcion: string; // Detalle narrativo
  fecha_accion: string;
  ip_usuario: string;
  dispositivo: string;
}
