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

  'hero.eyebrow': 'Software a la medida · Desde Costa Rica para el mundo',
  'hero.title': 'Soluciones de software que se adaptan a tu negocio, no al revés.',
  'hero.subtitle':
    'Desde tu primera página web hasta el sistema que ordena tu empresa. Trabajamos cerca de ti y ajustamos el rumbo cuando tu negocio lo necesita.',
  'hero.slogan': 'Sacamos de circulación tus necesidades de software.',
  'hero.cta_primary': 'Cuéntanos tu idea',
  'hero.cta_secondary': 'Agenda tu sesión 0',

  'value.1.title': 'Cercanía real',
  'value.1.body':
    'Hablas directamente con quien construye tu solución. Participas en cada etapa y ves avances desde el inicio.',
  'value.2.title': 'Nos adaptamos al cambio',
  'value.2.body':
    'Si tu negocio cambia mientras construimos, el software cambia con él. Ajustamos el plan contigo.',
  'value.3.title': 'Experiencia probada',
  'value.3.body':
    'Más de 17 años construyendo plataformas para empresas como Google, Sephora, Experian y Wells Fargo, ahora al servicio de tu proyecto.',

  'footer.slogan': 'Sacamos de circulación tus necesidades de software.',
  'footer.location': 'San José, Costa Rica · Trabajamos con clientes en todo el mundo',
  'footer.email_label': 'Escríbenos',
  'footer.linkedin': 'LinkedIn',
  'footer.copyright': '© 2026 DigitalStrike Solutions. Todos los derechos reservados.',
  'footer.privacy': 'Aviso de privacidad',

  'services.title': 'Lo que construimos',
  'process.title': 'Cómo trabajamos',
  'work.title': 'Proyectos de nuestro equipo',
  'about.title': 'La persona detrás de DigitalStrike',
  'clients.title': 'Empresas que confían en nosotros',
} as const;

export type ContentKey = keyof typeof es;
