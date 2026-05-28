/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Rol, Permiso, Usuario, Grado, Estudiante, 
  EstudianteAcudiente, Asistencia, Observacion, 
  Notificacion, Confirmacion, Auditoria, RoleId 
} from './types';

// 1. Roles Iniciales
export const INITIAL_ROLES: Rol[] = [
  { id_rol: 'admin', nombre_rol: 'Administrador', descripcion: 'Control total de la configuración, auditoría y personal del sistema.', estado: 'Activo' },
  { id_rol: 'coordinador', nombre_rol: 'Coordinador Académico', descripcion: 'Gestión de matrículas, grados, observaciones disciplinarias de alto nivel y reportes.', estado: 'Activo' },
  { id_rol: 'docente', nombre_rol: 'Docente', descripcion: 'Registro rápido de asistencias diarios y anotación de observaciones convivenciales directas.', estado: 'Activo' },
  { id_rol: 'acudiente', nombre_rol: 'Acudiente / Padre', descripcion: 'Consulta de la hoja de vida, asistencia, avisos y confirmaciones de lectura legales.', estado: 'Activo' }
];

// 2. Permisos Iniciales
export const INITIAL_PERMISOS: Permiso[] = [
  { id_permiso: 'asistencia_registrar', nombre_permiso: 'Registrar Asistencia', descripcion: 'Permite registrar la asistencia diaria de un grado.' },
  { id_permiso: 'asistencia_editar', nombre_permiso: 'Editar Asistencia', descripcion: 'Permite modificar registros de asistencia previos.' },
  { id_permiso: 'observacion_crear', nombre_permiso: 'Crear Observación', descripcion: 'Permite registrar notas disciplinarias o de reconocimiento.' },
  { id_permiso: 'observacion_eliminar', nombre_permiso: 'Eliminar Observación', descripcion: 'Permite revocar una anotación en la hoja de vida.' },
  { id_permiso: 'notificar_acudiente', nombre_permiso: 'Enviar Notificaciones', descripcion: 'Permite disparar correos de alerta a acudientes.' },
  { id_permiso: 'auditoria_ver', nombre_permiso: 'Ver Auditoría', descripcion: 'Permite visualizar la bitácora de auditoría legal y accesos.' },
  { id_permiso: 'usuarios_gestionar', nombre_permiso: 'Gestionar Usuarios', descripcion: 'Asignar roles, editar contraseñas y desactivar cuentas.' }
];

// 3. Usuarios Base
export const INITIAL_USUARIOS: Usuario[] = [
  {
    id_usuario: 'USR-001',
    tipo_documento: 'CC',
    numero_documento: '1014234567',
    nombres: 'Andrés Felipe',
    apellidos: 'Bustamante Silva',
    correo: 'andres.bustamante@ib.edu.co',
    telefono: '3124567890',
    password_hash: 'admin123',
    rol_id: 'coordinador',
    estado: 'Activo',
    fecha_creacion: '2026-01-10T08:00:00Z',
    ultimo_acceso: '2026-05-28T15:45:00Z'
  },
  {
    id_usuario: 'USR-002',
    tipo_documento: 'CC',
    numero_documento: '1015678901',
    nombres: 'Martha Julia',
    apellidos: 'Rodríguez Peña',
    correo: 'martha.rodriguez@ib.edu.co',
    telefono: '3007654321',
    password_hash: 'docente123',
    rol_id: 'docente',
    estado: 'Activo',
    fecha_creacion: '2026-01-11T09:30:00Z',
    ultimo_acceso: '2026-05-28T14:15:00Z'
  },
  {
    id_usuario: 'USR-003',
    tipo_documento: 'CC',
    numero_documento: '1016843219',
    nombres: 'Eduardo José',
    apellidos: 'Herrera Gómez',
    correo: 'eduardo.herrera@ib.edu.co',
    telefono: '3159876543',
    password_hash: 'docente123',
    rol_id: 'docente',
    estado: 'Activo',
    fecha_creacion: '2026-01-15T07:15:00Z',
    ultimo_acceso: '2026-05-28T11:00:00Z'
  },
  {
    id_usuario: 'USR-004',
    tipo_documento: 'CC',
    numero_documento: '98765432',
    nombres: 'Carlos Mario',
    apellidos: 'Paternina Díaz',
    correo: 'carlos.paternina@gmail.com',
    telefono: '3216549870',
    password_hash: 'acudiente123',
    rol_id: 'acudiente',
    estado: 'Activo',
    fecha_creacion: '2026-02-01T10:00:00Z',
    ultimo_acceso: '2026-05-28T15:20:00Z'
  },
  {
    id_usuario: 'USR-005',
    tipo_documento: 'CC',
    numero_documento: '87654321',
    nombres: 'Sofía Stella',
    apellidos: 'Valencia Medina',
    correo: 'sofia.valencia@hotmail.com',
    telefono: '3109988776',
    password_hash: 'acudiente123',
    rol_id: 'acudiente',
    estado: 'Activo',
    fecha_creacion: '2026-02-05T14:00:00Z',
    ultimo_acceso: '2026-05-27T19:30:00Z'
  }
];

// 4. Grados o Cursos
export const INITIAL_GRADOS: Grado[] = [
  {
    id_grado: 'GRADO-11A',
    nombre_grado: 'Once Grado (11°-A)',
    grupo: 'A',
    jornada: 'Mañana',
    director_grupo_id: 'USR-002', // Martha Rodríguez
    estado: 'Activo'
  },
  {
    id_grado: 'GRADO-CV',
    nombre_grado: 'Ciclo V - Sábado',
    grupo: 'Ciclo V',
    jornada: 'Sábado',
    director_grupo_id: 'USR-003', // Eduardo Herrera
    estado: 'Activo'
  },
  {
    id_grado: 'GRADO-10B',
    nombre_grado: 'Décimo Grado (10°-B)',
    grupo: 'B',
    jornada: 'Tarde',
    director_grupo_id: 'USR-002',
    estado: 'Activo'
  }
];

// 5. Estudiantes
export const INITIAL_ESTUDIANTES: Estudiante[] = [
  {
    id_estudiante: 'EST-101',
    tipo_documento: 'TI',
    numero_documento: '1085123456',
    nombres: 'Mateo Andrés',
    apellidos: 'Paternina Castro',
    fecha_nacimiento: '2009-07-14',
    grado_id: 'GRADO-11A',
    jornada: 'Mañana',
    estado: 'Activo',
    fecha_ingreso: '2024-01-22',
    codigo_acceso: '1234'
  },
  {
    id_estudiante: 'EST-102',
    tipo_documento: 'TI',
    numero_documento: '1085765432',
    nombres: 'Daniela Sofía',
    apellidos: 'Serna Valencia',
    fecha_nacimiento: '2010-03-05',
    grado_id: 'GRADO-11A',
    jornada: 'Mañana',
    estado: 'Activo',
    fecha_ingreso: '2024-01-22',
    codigo_acceso: '2345'
  },
  {
    id_estudiante: 'EST-103',
    tipo_documento: 'TI',
    numero_documento: '1086202020',
    nombres: 'Santiago Andrés',
    apellidos: 'Rios Marulanda',
    fecha_nacimiento: '2009-11-20',
    grado_id: 'GRADO-11A',
    jornada: 'Mañana',
    estado: 'Activo',
    fecha_ingreso: '2024-01-25',
    codigo_acceso: '3456'
  },
  // Ciclo V Sábado students
  {
    id_estudiante: 'EST-201',
    tipo_documento: 'TI',
    numero_documento: '1095333444',
    nombres: 'Brayan Estiven',
    apellidos: 'Paternina Díaz',
    fecha_nacimiento: '2008-05-12',
    grado_id: 'GRADO-CV',
    jornada: 'Sábado',
    estado: 'Activo',
    fecha_ingreso: '2025-01-18',
    codigo_acceso: '4567'
  },
  {
    id_estudiante: 'EST-202',
    tipo_documento: 'TI',
    numero_documento: '1095999888',
    nombres: 'Camila Patricia',
    apellidos: 'López Restrepo',
    fecha_nacimiento: '2007-12-01',
    grado_id: 'GRADO-CV',
    jornada: 'Sábado',
    estado: 'Activo',
    fecha_ingreso: '2025-01-18',
    codigo_acceso: '5678'
  },
  {
    id_estudiante: 'EST-203',
    tipo_documento: 'CC',
    numero_documento: '1017555333',
    nombres: 'Juan Diego',
    apellidos: 'Serna Valencia',
    fecha_nacimiento: '2005-09-18',
    grado_id: 'GRADO-CV',
    jornada: 'Sábado',
    estado: 'Activo',
    fecha_ingreso: '2025-01-18',
    codigo_acceso: '6789'
  }
];

// Relation student-acudiente
export const INITIAL_ESTUDIANTE_ACUDIENTE: EstudianteAcudiente[] = [
  { id_estudiante: 'EST-101', id_acudiente: 'USR-004', parentesco: 'Padre', es_principal: true, recibe_notificaciones: true },
  { id_estudiante: 'EST-102', id_acudiente: 'USR-005', parentesco: 'Madre', es_principal: true, recibe_notificaciones: true },
  { id_estudiante: 'EST-201', id_acudiente: 'USR-004', parentesco: 'Padre', es_principal: true, recibe_notificaciones: true },
  { id_estudiante: 'EST-203', id_acudiente: 'USR-005', parentesco: 'Madre', es_principal: true, recibe_notificaciones: true }
];

// 6. Asistencia
export const INITIAL_ASISTENCIAS: Asistencia[] = [
  // 11A - 26 Mayo
  {
    id_asistencia: 'AST-001',
    id_estudiante: 'EST-101',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-26',
    hora_registro: '07:05:00',
    estado_asistencia: 'Presente',
    observacion: 'Llegó a tiempo.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-26T07:05:00Z'
  },
  {
    id_asistencia: 'AST-002',
    id_estudiante: 'EST-102',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-26',
    hora_registro: '07:08:21',
    estado_asistencia: 'Ausente',
    observacion: 'Inasistencia sin justificar hasta el momento.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-26T07:10:00Z'
  },
  {
    id_asistencia: 'AST-003',
    id_estudiante: 'EST-103',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-26',
    hora_registro: '07:06:12',
    estado_asistencia: 'Presente',
    observacion: 'Sin observaciones',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-26T07:10:00Z'
  },
  // 11A - 27 Mayo
  {
    id_asistencia: 'AST-004',
    id_estudiante: 'EST-101',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-27',
    hora_registro: '07:12:11',
    estado_asistencia: 'Tarde',
    observacion: 'Tránsito lento reportado por el acudiente.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-27T07:15:00Z'
  },
  {
    id_asistencia: 'AST-005',
    id_estudiante: 'EST-102',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-27',
    hora_registro: '07:04:19',
    estado_asistencia: 'Presente',
    observacion: '',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-27T07:15:00Z'
  },
  {
    id_asistencia: 'AST-006',
    id_estudiante: 'EST-103',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-27',
    hora_registro: '07:25:00',
    estado_asistencia: 'Ausente',
    observacion: 'Falta sin aviso.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-27T07:30:00Z'
  },
  // 11A - 28 Mayo (Hoy)
  {
    id_asistencia: 'AST-007',
    id_estudiante: 'EST-101',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-28',
    hora_registro: '07:02:11',
    estado_asistencia: 'Presente',
    observacion: 'Ingreso estándar',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-28T07:05:00Z'
  },
  {
    id_asistencia: 'AST-008',
    id_estudiante: 'EST-102',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-28',
    hora_registro: '07:11:40',
    estado_asistencia: 'Ausente',
    observacion: 'No se presenta a primera hora. Recurrente esta semana.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-28T07:15:00Z'
  },
  {
    id_asistencia: 'AST-009',
    id_estudiante: 'EST-103',
    id_docente: 'USR-002',
    id_grado: 'GRADO-11A',
    fecha: '2026-05-28',
    hora_registro: '07:22:15',
    estado_asistencia: 'Tarde',
    observacion: 'Inició transporte tarde.',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-28T07:25:00Z'
  }
];

// 7. Observaciones Disciplinarias
export const INITIAL_OBSERVACIONES: Observacion[] = [
  {
    id_observacion: 'OBS-001',
    id_estudiante: 'EST-101',
    id_docente: 'USR-002',
    tipo_observacion: 'Reconocimiento positivo',
    categoria: 'Liderazgo escolar',
    descripcion: 'Felicitaciones a Mateo por liderar la organización del Proyecto de Ciencia y Tecnología del grado Once. Excelente actitud colaborativa laboral.',
    nivel_gravedad: 'Bajo',
    fecha_observacion: '2026-05-20',
    estado: 'Vigente',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-20T10:30:00Z'
  },
  {
    id_observacion: 'OBS-002',
    id_estudiante: 'EST-102',
    id_docente: 'USR-002',
    tipo_observacion: 'Disciplinaria',
    categoria: 'Inasistencia recurrente',
    descripcion: 'La estudiante Daniela Serna ha acumulado varias ausencias injustificadas seguidas del área analgésica. Se requiere reunión urgente con el acudiente.',
    nivel_gravedad: 'Alto',
    fecha_observacion: '2026-05-25',
    estado: 'Vigente',
    registrado_por: 'Martha Julia Rodríguez Peña',
    fecha_creacion: '2026-05-25T11:45:00Z'
  },
  {
    id_observacion: 'OBS-003',
    id_estudiante: 'EST-201',
    id_docente: 'USR-003',
    tipo_observacion: 'Convivencial',
    categoria: 'Falta de respeto',
    descripcion: 'Brayan Paternina tuvo un altercado verbal alterado con un docente en el patio principal durante el receso del Sábado. Comisión citada a primera hora.',
    nivel_gravedad: 'Crítico',
    fecha_observacion: '2026-05-23',
    estado: 'Vigente',
    registrado_por: 'Eduardo José Herrera Gómez',
    fecha_creacion: '2026-05-23T14:20:00Z'
  }
];

// 8. Notificaciones
export const INITIAL_NOTIFICACIONES: Notificacion[] = [
  {
    id_notificacion: 'NTF-001',
    id_estudiante: 'EST-101',
    id_acudiente: 'USR-004', // Carlos Paternina
    tipo_notificacion: 'Asistencia',
    canal: 'Correo electrónico',
    asunto: 'Reporte de Llegada Tarde - Once (11A)',
    mensaje: 'Estimado acudiente Carlos Mario Paternina, le informamos que el estudiante Mateo Andrés Paternina Castro registró llegada TARDE hoy 27 de Mayo a las 07:12 AM.',
    estado_envio: 'Enviada',
    fecha_envio: '2026-05-27T07:16:00Z',
    fecha_lectura: '2026-05-27T08:10:00Z'
  },
  {
    id_notificacion: 'NTF-002',
    id_estudiante: 'EST-102',
    id_acudiente: 'USR-005', // Sofía Stella Valencia
    tipo_notificacion: 'Disciplinaria',
    canal: 'Correo electrónico',
    asunto: 'Apertura de Observación Disciplinaria Crítica',
    mensaje: 'Estimada acudiente Sofía Stella Valencia Medina, le notificamos que se ha abierto una observación de gravedad ALTA en la hoja de vida de su acudido Daniela Sofía por inasistencias injustificadas, consulte ingresando a la plataforma.',
    estado_envio: 'Pendiente',
    fecha_envio: '2026-05-25T12:00:00Z',
    fecha_lectura: null
  },
  {
    id_notificacion: 'NTF-003',
    id_estudiante: 'EST-201',
    id_acudiente: 'USR-004',
    tipo_notificacion: 'Alerta Crítica',
    canal: 'Correo electrónico',
    asunto: 'Urgente: Citación a Coordinación Convivencial',
    mensaje: 'Estimado Carlos Paternina, solicitamos su presencia obligatoria en la oficina de Coordinación el próximo Sábado debido a un incidente convivencial crítico de Brayan Paternina Díaz.',
    estado_envio: 'Enviada',
    fecha_envio: '2026-05-23T14:30:00Z',
    fecha_lectura: null
  }
];

// 9. Confirmaciones de Lectura
export const INITIAL_CONFIRMACIONES: Confirmacion[] = [
  {
    id_confirmacion: 'CON-001',
    id_notificacion: 'NTF-001',
    id_acudiente: 'USR-004',
    fecha_confirmacion: '2026-05-27T08:12:00Z',
    comentario_acudiente: 'Entendido. No volverá a suceder, el transporte se retrasó por taponamiento vial.',
    ip_confirmacion: '190.248.81.43'
  }
];

// 10. Auditoría legal
export const INITIAL_AUDITORIA: Auditoria[] = [
  {
    id_auditoria: 'AUD-001',
    id_usuario: 'USR-002',
    usuario_nombre: 'Martha Julia Rodríguez Peña',
    usuario_rol: 'docente',
    accion: 'Registrar Asistencia',
    modulo: 'Asistencias',
    descripcion: 'Planilla de asistencia para el grado 11°-A creada y guardada con 2 presentes y 1 ausente.',
    fecha_accion: '2026-05-26T07:11:00Z',
    ip_usuario: '186.115.42.10',
    dispositivo: 'Vivaldi Browser (PC-Biblioteca)'
  },
  {
    id_auditoria: 'AUD-002',
    id_usuario: 'USR-002',
    usuario_nombre: 'Martha Julia Rodríguez Peña',
    usuario_rol: 'docente',
    accion: 'Crear Observación',
    modulo: 'Observaciones',
    descripcion: 'Anotación de Liderazgo escolar para Mateo Paternina insertada correctamente en el libro de vida digital de Once.',
    fecha_accion: '2026-05-20T10:30:45Z',
    ip_usuario: '186.115.42.10',
    dispositivo: 'Vivaldi Browser (PC-Biblioteca)'
  },
  {
    id_auditoria: 'AUD-003',
    id_usuario: 'USR-001',
    usuario_nombre: 'Andrés Felipe Bustamante',
    usuario_rol: 'coordinador',
    accion: 'Consultar Historial',
    modulo: 'Usuarios',
    descripcion: 'Consulta masiva de registros de ingresos y bitácoras para autoridación académica.',
    fecha_accion: '2026-05-28T15:45:12Z',
    ip_usuario: '190.143.2.98',
    dispositivo: 'Chrome Mobile (Android - Motorola G84)'
  }
];

// Manager del estado con persistencia dinámica en LocalStorage
class StateManager {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`lib_bolivariano_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error leyendo ${key} de LocalStorage`, e);
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`lib_bolivariano_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Error guardando ${key} en LocalStorage`, e);
    }
  }

  // Getters
  getUsuarios(): Usuario[] {
    return this.getStorageItem<Usuario[]>('usuarios', INITIAL_USUARIOS);
  }

  getRoles(): Rol[] {
    return INITIAL_ROLES;
  }

  getPermisos(): Permiso[] {
    return INITIAL_PERMISOS;
  }

  getGrados(): Grado[] {
    return this.getStorageItem<Grado[]>('grados', INITIAL_GRADOS);
  }

  getEstudiantes(): Estudiante[] {
    return this.getStorageItem<Estudiante[]>('estudiantes', INITIAL_ESTUDIANTES);
  }

  getRelaciones(): EstudianteAcudiente[] {
    return this.getStorageItem<EstudianteAcudiente[]>('relaciones', INITIAL_ESTUDIANTE_ACUDIENTE);
  }

  getAsistencias(): Asistencia[] {
    return this.getStorageItem<Asistencia[]>('asistencias', INITIAL_ASISTENCIAS);
  }

  getObservaciones(): Observacion[] {
    return this.getStorageItem<Observacion[]>('observaciones', INITIAL_OBSERVACIONES);
  }

  getNotificaciones(): Notificacion[] {
    return this.getStorageItem<Notificacion[]>('notificaciones', INITIAL_NOTIFICACIONES);
  }

  getConfirmaciones(): Confirmacion[] {
    return this.getStorageItem<Confirmacion[]>('confirmaciones', INITIAL_CONFIRMACIONES);
  }

  getAuditoria(): Auditoria[] {
    return this.getStorageItem<Auditoria[]>('auditoria', INITIAL_AUDITORIA);
  }

  // Nuevos métodos de Autenticación e Importación
  loginAcudiente(documento: string, pin: string): Usuario | null {
    const estudiante = this.getEstudiantes().find(e => 
      e.numero_documento === documento && e.codigo_acceso === pin
    );

    if (!estudiante) return null;

    const relacion = this.getRelaciones().find(r => r.id_estudiante === estudiante.id_estudiante && r.es_principal);
    if (!relacion) return null;

    const acudiente = this.getUsuarios().find(u => u.id_usuario === relacion.id_acudiente && u.rol_id === 'acudiente');
    return acudiente || null;
  }

  crearEstudianteIndividual(datos: { documento: string; nombres: string; apellidos: string; grado_id: string; jornada: string }, idCoordinador: string): { estudiante: Estudiante, pin: string } | null {
    const actuales = this.getEstudiantes();
    
    // Validar duplicado
    const duplicado = actuales.some(e => e.numero_documento === datos.documento);
    if (duplicado) return null;

    const nuevoPin = Math.floor(1000 + Math.random() * 9000).toString();
    const nuevoEstudiante: Estudiante = {
      id_estudiante: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo_documento: 'TI',
      numero_documento: datos.documento,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      fecha_nacimiento: '2010-01-01',
      grado_id: datos.grado_id || 'GRADO-11A',
      jornada: datos.jornada || 'Mañana',
      estado: 'Activo',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      codigo_acceso: nuevoPin
    };

    this.setStorageItem('estudiantes', [...actuales, nuevoEstudiante]);

    const coordinador = this.getUsuarios().find(u => u.id_usuario === idCoordinador);
    if (coordinador) {
      this.addAuditLog(
        coordinador.id_usuario,
        `${coordinador.nombres} ${coordinador.apellidos}`,
        coordinador.rol_id,
        'Crear Estudiante',
        'Estudiantes',
        `Se creó manualmente al estudiante ${datos.nombres} con documento ${datos.documento}.`,
        '127.0.0.1',
        'Plataforma Web'
      );
    }

    return { estudiante: nuevoEstudiante, pin: nuevoPin };
  }

  registrarEntradaKiosco(identificador: string, idCoordinador: string): { status: 'success' | 'error', message: string, estudiante?: Estudiante } {
    const estudiantes = this.getEstudiantes();
    const estudiante = estudiantes.find(e => e.id_estudiante === identificador || e.numero_documento === identificador);
    
    if (!estudiante) {
      return { status: 'error', message: 'Estudiante no encontrado. Verifique el ID o Documento.' };
    }

    const hoy = new Date().toISOString().split('T')[0];
    const asistencias = this.getAsistencias();
    
    const yaRegistro = asistencias.find(a => a.id_estudiante === estudiante.id_estudiante && a.fecha === hoy);
    
    if (yaRegistro) {
      return { status: 'error', message: `Entrada Duplicada: ${estudiante.nombres} ya ingresó hoy.`, estudiante };
    }

    const nuevaAsistencia: Asistencia = {
      id_asistencia: `ASI-${Math.floor(10000 + Math.random() * 90000)}`,
      id_estudiante: estudiante.id_estudiante,
      id_docente: idCoordinador,
      id_grado: estudiante.grado_id,
      fecha: hoy,
      hora_registro: new Date().toLocaleTimeString('es-CO', { hour12: false }),
      estado_asistencia: 'Presente',
      observacion: 'Ingreso por Torniquete Principal',
      registrado_por: 'Kiosco Automático',
      fecha_creacion: new Date().toISOString()
    };

    this.setStorageItem('asistencias', [...asistencias, nuevaAsistencia]);

    return { status: 'success', message: 'ENTRADA REGISTRADA', estudiante };
  }

  importarEstudiantesCSV(csvString: string, idCoordinador: string): number {
    const lineas = csvString.split('\n').filter(l => l.trim() !== '');
    if (lineas.length <= 1) return 0; // Solo cabecera o vacío

    const nuevosEstudiantes: Estudiante[] = [];
    const estudiantesActuales = this.getEstudiantes();
    let agregados = 0;

    for (let i = 1; i < lineas.length; i++) {
      const parts = lineas[i].split(',').map(s => s.trim());
      // Asumimos formato: documento,nombres,apellidos,grado_id,jornada
      const [documento, nombres, apellidos, grado_id, jornada] = parts;

      if (!documento || !nombres || !apellidos) continue;

      const duplicado = estudiantesActuales.some(e => 
        e.numero_documento === documento && 
        e.grado_id === (grado_id || 'GRADO-11A') && 
        e.jornada === (jornada || 'Mañana')
      ) || nuevosEstudiantes.some(e => 
        e.numero_documento === documento && 
        e.grado_id === (grado_id || 'GRADO-11A') && 
        e.jornada === (jornada || 'Mañana')
      );

      if (!duplicado) {
        nuevosEstudiantes.push({
          id_estudiante: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
          tipo_documento: 'TI',
          numero_documento: documento,
          nombres,
          apellidos,
          fecha_nacimiento: '2010-01-01', // Valor por defecto
          grado_id: grado_id || 'GRADO-11A',
          jornada: jornada || 'Mañana',
          estado: 'Activo',
          fecha_ingreso: new Date().toISOString().split('T')[0],
          codigo_acceso: Math.floor(1000 + Math.random() * 9000).toString()
        });
        agregados++;
      }
    }

    if (agregados > 0) {
      this.setStorageItem('estudiantes', [...estudiantesActuales, ...nuevosEstudiantes]);
      
      const coordinador = this.getUsuarios().find(u => u.id_usuario === idCoordinador);
      if (coordinador) {
        this.addAuditLog(
          coordinador.id_usuario,
          `${coordinador.nombres} ${coordinador.apellidos}`,
          coordinador.rol_id,
          'Importar Estudiantes',
          'Estudiantes',
          `Se importaron ${agregados} estudiantes mediante CSV.`,
          '127.0.0.1',
          'Plataforma Web'
        );
      }
    }
    
    return agregados;
  }

  // Mutadores
  saveAsistencias(nuevasAsistencias: Asistencia[], autorUsuario: Usuario) {
    const actuales = this.getAsistencias();
    // Reemplazar anteriores para las mismas llaves de fecha y estudiante
    const filtrados = actuales.filter(act => 
      !nuevasAsistencias.some(n => n.fecha === act.fecha && n.id_estudiante === act.id_estudiante)
    );
    const finalAsistencias = [...filtrados, ...nuevasAsistencias];
    this.setStorageItem('asistencias', finalAsistencias);

    // Auditoría automática
    const fechaStr = nuevasAsistencias[0]?.fecha || 'hoy';
    const gradoNom = this.getGrados().find(g => g.id_grado === nuevasAsistencias[0]?.id_grado)?.nombre_grado || 'grado';
    
    this.addAuditLog(
      autorUsuario.id_usuario,
      autorUsuario.nombres + ' ' + autorUsuario.apellidos,
      autorUsuario.rol_id,
      'Registrar Asistencia',
      'Asistencias',
      `Se registró la planilla de asistencia de ${gradoNom} para el día ${fechaStr}. Total de registros: ${nuevasAsistencias.length}.`,
      '186.115.42.10',
      'Plataforma Web (Docente)'
    );

    // Generar alertas automáticas de inasistencia para cada ausente
    nuevasAsistencias.forEach(as => {
      if (as.estado_asistencia === 'Ausente' || as.estado_asistencia === 'Tarde') {
        const relacionesEst = this.getRelaciones().filter(r => r.id_estudiante === as.id_estudiante && r.recibe_notificaciones);
        const est = this.getEstudiantes().find(e => e.id_estudiante === as.id_estudiante);
        
        relacionesEst.forEach(rel => {
          this.addNotificacion(
            as.id_estudiante,
            rel.id_acudiente,
            'Asistencia',
            `Alerta de Inasistencia / Retraso: ${est?.nombres} ${est?.apellidos}`,
            `Estimado acudiente, le notificamos que su acudido ${est?.nombres} fue marcado como [${as.estado_asistencia.toUpperCase()}] en la clase de hoy ${as.fecha} a las ${as.hora_registro}. Agradecemos su trámite de excusa correspondiente.`,
            as.estado_asistencia === 'Ausente' ? 'Circular' : 'Asistencia'
          );
        });
      }
    });
  }

  addObservacion(obs: Omit<Observacion, 'id_observacion' | 'fecha_creacion'>, autorUsuario: Usuario) {
    const actuales = this.getObservaciones();
    const nuevaObs: Observacion = {
      ...obs,
      id_observacion: `OBS-${Math.floor(100 + Math.random() * 900)}`,
      fecha_creacion: new Date().toISOString()
    };
    
    this.setStorageItem('observaciones', [nuevaObs, ...actuales]);

    // Estudiante info
    const est = this.getEstudiantes().find(e => e.id_estudiante === obs.id_estudiante);
    const estNom = est ? `${est.nombres} ${est.apellidos}` : 'Estudiante';

    // Auditoría
    this.addAuditLog(
      autorUsuario.id_usuario,
      autorUsuario.nombres + ' ' + autorUsuario.apellidos,
      autorUsuario.rol_id,
      'Crear Observación',
      'Observaciones',
      `Creada observación de tipo [${obs.tipo_observacion}] de gravedad [${obs.nivel_gravedad}] para el estudiante ${estNom}. Categoría: ${obs.categoria}.`,
      '186.115.42.10',
      'Plataforma Web'
    );

    // Auto notificamos a los acudientes si es una falta Media, Alta o Crítica
    if (obs.nivel_gravedad !== 'Bajo') {
      const relacionesEst = this.getRelaciones().filter(r => r.id_estudiante === obs.id_estudiante);
      relacionesEst.forEach(rel => {
        this.addNotificacion(
          obs.id_estudiante,
          rel.id_acudiente,
          'Disciplinaria',
          `Nueva Observación Docente: ${obs.categoria}`,
          `Estimado acudiente, se ha registrado una nueva anotación del tipo [${obs.tipo_observacion}] en la hoja de vida de su representado. Detalle: "${obs.descripcion}". Se cataloga de gravedad ${obs.nivel_gravedad}.`,
          obs.nivel_gravedad === 'Crítico' ? 'Alerta Crítica' : 'Disciplinaria'
        );
      });
    }
  }

  addNotificacion(
    idEstudiante: string, 
    idAcudiente: string, 
    tipo: 'Asistencia' | 'Disciplinaria' | 'Circular' | 'Alerta Crítica', 
    asunto: string, 
    mensaje: string, 
    categoriaGral?: string
  ) {
    const actuales = this.getNotificaciones();
    const nueva: Notificacion = {
      id_notificacion: `NTF-${Math.floor(100 + Math.random() * 900)}`,
      id_estudiante: idEstudiante,
      id_acudiente: idAcudiente,
      tipo_notificacion: tipo,
      canal: 'Correo electrónico',
      asunto,
      mensaje,
      estado_envio: 'Enviada',
      fecha_envio: new Date().toISOString(),
      fecha_lectura: null
    };

    this.setStorageItem('notificaciones', [nueva, ...actuales]);
  }

  confirmarNotificacion(idNotificacion: string, idAcudiente: string, comentario: string, acudienteNombre: string) {
    const notificaciones = this.getNotificaciones();
    const notiIdx = notificaciones.findIndex(n => n.id_notificacion === idNotificacion);
    
    if (notiIdx !== -1) {
      notificaciones[notiIdx].estado_envio = 'Confirmada';
      notificaciones[notiIdx].fecha_lectura = new Date().toISOString();
      this.setStorageItem('notificaciones', notificaciones);

      const confirmaciones = this.getConfirmaciones();
      const nuevaConf: Confirmacion = {
        id_confirmacion: `CON-${Math.floor(100 + Math.random() * 900)}`,
        id_notificacion: idNotificacion,
        id_acudiente: idAcudiente,
        fecha_confirmacion: new Date().toISOString(),
        comentario_acudiente: comentario,
        ip_confirmacion: `190.248.${Math.floor(10 + Math.random() * 200)}.${Math.floor(1 + Math.random() * 254)}`
      };
      
      this.setStorageItem('confirmaciones', [nuevaConf, ...confirmaciones]);

      // Guardar auditoría
      this.addAuditLog(
        idAcudiente,
        acudienteNombre,
        'acudiente',
        'Confirmar Notificación',
        'Notificaciones',
        `Acudiente firmó digitalmente la constancia de notificación jurídica [${idNotificacion}] con comentario: "${comentario}".`,
        nuevaConf.ip_confirmacion,
        'Móvil Familiar (Safari - iOS)'
      );
    }
  }

  addAuditLog(
    idUsuario: string,
    usuarioNombre: string,
    rol: RoleId,
    accion: string,
    modulo: string,
    descripcion: string,
    ip: string,
    dispositivo: string
  ) {
    const actuales = this.getAuditoria();
    const nuevoLog: Auditoria = {
      id_auditoria: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      id_usuario: idUsuario,
      usuario_nombre: usuarioNombre,
      usuario_rol: rol,
      accion,
      modulo,
      descripcion,
      fecha_accion: new Date().toISOString(),
      ip_usuario: ip,
      dispositivo
    };
    
    this.setStorageItem('auditoria', [nuevoLog, ...actuales]);
  }

  resetState() {
    localStorage.removeItem('lib_bolivariano_usuarios');
    localStorage.removeItem('lib_bolivariano_grados');
    localStorage.removeItem('lib_bolivariano_estudiantes');
    localStorage.removeItem('lib_bolivariano_relaciones');
    localStorage.removeItem('lib_bolivariano_asistencias');
    localStorage.removeItem('lib_bolivariano_observaciones');
    localStorage.removeItem('lib_bolivariano_notificaciones');
    localStorage.removeItem('lib_bolivariano_confirmaciones');
    localStorage.removeItem('lib_bolivariano_auditoria');
  }
}

export const db = new StateManager();
