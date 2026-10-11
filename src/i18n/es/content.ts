// Spanish is the source language (BR-005). Every string is copied verbatim from docs/ux/CONTENT.md;
// keys use the CONTENT.md key names. Change the copy in CONTENT.md first, then here.
export const es = {
  'meta.title': 'DigitalStrike Solutions · Software a la medida para tu negocio',
  'meta.description':
    'Páginas web, aplicaciones y sistemas a la medida para personas emprendedoras y empresas. Trabajamos cerca de ti, desde Costa Rica para el mundo.',
  'meta.og_alt': 'Logo de DigitalStrike Solutions: una bola de béisbol con un cursor de terminal',

  'nav.services': 'Servicios',
  'nav.process': 'Cómo trabajamos',
  'nav.work': 'Proyectos',
  'nav.about': 'Nosotros',
  'nav.contact': 'Contacto',
  'nav.cta': 'Agenda tu sesión 0',
  'nav.menu_open': 'Abrir menú',
  'nav.menu_close': 'Cerrar menú',
  'lang.toggle_label': 'Cambiar idioma',
  skip_link: 'Saltar al contenido',

  'services.title': 'Lo que construimos',
  'process.title': 'Cómo trabajamos',
  'work.title': 'Proyectos de nuestro equipo',
  'about.title': 'La persona detrás de DigitalStrike',
  'clients.title': 'Empresas que confían en nosotros',
} as const;

export type ContentKey = keyof typeof es;
