export interface Accion {
  titulo: string;
  descripcion: string;
  href: string;
  icono: string;
  acento:
    | 'bg-brutal-cyan'
    | 'bg-brutal-gold'
    | 'bg-brutal-lima'
    | 'bg-brutal-rosa'
    | 'bg-brutal-indigo'
    | 'bg-brutal-naranja'
    | 'bg-brutal-teal';
}

export const accionesPorRol: Record<string, Accion[]> = {
  POSTULANTE: [
    { titulo: 'Nueva solicitud',     descripcion: 'Postúlate a una convocatoria abierta',         href: '/solicitudes/nueva', icono: '＋', acento: 'bg-brutal-cyan' },
    { titulo: 'Mis solicitudes',     descripcion: 'Seguimiento y estados de tus postulaciones',   href: '/dashboard',         icono: '▤', acento: 'bg-brutal-gold' },
    { titulo: 'Ver convocatorias',   descripcion: 'Explora los programas de becas disponibles',   href: '/convocatorias',     icono: '◎', acento: 'bg-brutal-lima' },
    { titulo: 'Consultar estado',    descripcion: 'Consulta el estado de tu solicitud por CUI',   href: '/consulta',          icono: '⚲', acento: 'bg-brutal-rosa' },
    { titulo: 'Mis datos',           descripcion: 'Completa tu información personal',             href: '/perfil',            icono: '☰', acento: 'bg-brutal-indigo' },
  ],
  EVALUADOR: [
    { titulo: 'Mis evaluaciones',    descripcion: 'Revisa y puntúa las solicitudes asignadas',    href: '/evaluador',         icono: '★', acento: 'bg-brutal-cyan' },
    { titulo: 'Mis reportes',        descripcion: 'KPIs de tu actividad de evaluación',           href: '/reportes',          icono: '📊', acento: 'bg-brutal-indigo' },
  ],
  COORDINADOR_COMITE: [
    { titulo: 'Sesiones',            descripcion: 'Crea y gestiona las sesiones de los comités',  href: '/coordinador',       icono: '▣', acento: 'bg-brutal-gold' },
    { titulo: 'Mis reportes',        descripcion: 'KPIs de tus comités y sesiones',               href: '/reportes',          icono: '📊', acento: 'bg-brutal-indigo' },
  ],
  MIEMBRO_COMITE: [
    { titulo: 'Votar en sesión',     descripcion: 'Participa en las sesiones y emite tu voto',    href: '/comite',            icono: '✎', acento: 'bg-brutal-lima' },
    { titulo: 'Mis reportes',        descripcion: 'KPIs de tu participación en sesiones',         href: '/reportes',          icono: '📊', acento: 'bg-brutal-indigo' },
  ],
  ADMIN: [
    { titulo: 'Convocatorias',       descripcion: 'Crea, publica y transiciona convocatorias',    href: '/admin', icono: '⛋', acento: 'bg-brutal-cyan' },
    { titulo: 'Solicitudes',         descripcion: 'Revisa expedientes y estados',                 href: '/admin', icono: '▤', acento: 'bg-brutal-gold' },
    { titulo: 'Comités',             descripcion: 'Organiza comités evaluadores',                 href: '/admin', icono: '▣', acento: 'bg-brutal-lima' },
    { titulo: 'Sesiones',            descripcion: 'Agenda y resuelve sesiones',                   href: '/admin', icono: '⚲', acento: 'bg-brutal-rosa' },
    { titulo: 'Seguridad',           descripcion: 'Roles, permisos y usuarios',                  href: '/admin', icono: '☰', acento: 'bg-brutal-indigo' },
    { titulo: 'Reportes',            descripcion: 'KPIs, embudo, tendencia y exportación CSV',   href: '/reportes', icono: '📊', acento: 'bg-brutal-teal' },
    { titulo: 'Auditoría',           descripcion: 'Historial de mutaciones por usuario/entidad',  href: '/auditoria', icono: '📋', acento: 'bg-brutal-naranja' },
  ],
};
