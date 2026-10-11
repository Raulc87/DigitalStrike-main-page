// Spanish is the source language (BR-005). Form copy verbatim from docs/ux/CONTENT.md §10 (keys use
// the CONTENT.md key names); option labels verbatim from LEAD_ENDPOINT_CONTRACT.md §4.
// Change the copy in CONTENT.md (or the contract) first, then here and in ../en/form.ts.
export const esForm = {
  'form.title': 'Cuéntanos tu idea',
  'form.intro': 'Responde unas preguntas rápidas. Te escribimos en un máximo de 2 días hábiles.',
  'form.required_note': 'Los campos con * son obligatorios.',
  'form.name.label': 'Nombre *',
  'form.email.label': 'Correo electrónico *',
  'form.phone.label': 'Teléfono o WhatsApp (opcional)',
  'form.phone.hint': 'Incluye el código de país, por ejemplo +506 8888 0000.',
  'form.company.label': 'Empresa o marca (opcional)',
  'form.project_type.label': '¿Qué necesitas? *',
  'form.budget_range.label': '¿Cuánto planeas invertir? *',
  'form.budget_range.hint': 'Nos ayuda a proponerte la mejor solución para tu presupuesto.',
  'form.timeline.label': '¿Para cuándo lo necesitas? *',
  'form.message.label': 'Cuéntanos el problema o la idea *',
  'form.message.hint':
    'Qué quieres lograr, para quién y qué has intentado hasta ahora. Mínimo 20 caracteres.',
  'form.select_placeholder': 'Elige una opción',
  'form.consent.label':
    'Acepto que DigitalStrike Solutions use mis datos para responder a mi solicitud, según el aviso de privacidad. *',
  'form.consent.link': 'Leer el aviso de privacidad',
  'form.submit': 'Enviar mi idea',
  'form.submitting': 'Enviando…',
  'form.success.title': '¡Recibido, {first_name}!',
  'form.success.body':
    'Ya tenemos tu idea. Te escribiremos en un máximo de 2 días hábiles. Si quieres adelantar, agenda tu sesión 0 aquí abajo.',
  'form.success.cta': 'Agendar mi sesión 0',

  'form.project_type.website': 'Página web',
  'form.project_type.web_app': 'Aplicación web (catálogo, agenda, cursos…)',
  'form.project_type.business_system': 'Sistema para mi empresa (inventario, reportes, procesos)',
  'form.project_type.custom_solution': 'Solución a la medida / algo fuera de lo común',
  'form.project_type.not_sure': 'Aún no lo sé',
  'form.budget_range.under_1000': 'Menos de US$1.000',
  'form.budget_range.from_1000_to_3000': 'US$1.000 – 3.000',
  'form.budget_range.from_3000_to_10000': 'US$3.000 – 10.000',
  'form.budget_range.from_10000_to_25000': 'US$10.000 – 25.000',
  'form.budget_range.over_25000': 'Más de US$25.000',
  'form.budget_range.not_sure': 'Aún no lo tengo definido',
  'form.timeline.asap': 'Lo antes posible',
  'form.timeline.within_1_month': 'En el próximo mes',
  'form.timeline.within_3_months': 'En los próximos 3 meses',
  'form.timeline.flexible': 'Sin prisa / flexible',

  'form.error.required': 'Este campo es obligatorio.',
  'form.error.too_short.name': 'Escribe al menos 2 caracteres.',
  'form.error.too_short.message': 'Cuéntanos un poco más (mínimo 20 caracteres).',
  'form.error.too_long': 'Es demasiado largo.',
  'form.error.invalid_format.name': 'Usa solo letras, espacios, apóstrofos, guiones o puntos.',
  'form.error.invalid_format.email': 'Revisa el correo, por ejemplo nombre@ejemplo.com.',
  'form.error.invalid_format.phone': 'Revisa el número, por ejemplo +506 8888 0000.',
  'form.error.invalid_option': 'Elige una de las opciones.',
  'form.error.must_be_true': 'Necesitamos tu consentimiento para responderte.',
  'form.error.rate_limited':
    'En este momento no podemos recibir más mensajes por aquí. Inténtalo más tarde o escríbenos directamente a {email}.',
  'form.error.generic': 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a {email}.',
  'form.error_summary': 'Revisa los campos marcados.',
  'privacy.title': 'Aviso de privacidad — DigitalStrike Solutions',
  'privacy.version': 'Versión {version}',
  'privacy.controller.title': 'Quién es responsable de tus datos.',
  'privacy.controller.body':
    'Raul Casañas, quien opera bajo la marca DigitalStrike Solutions en San José, Costa Rica. Contacto: {contact_email}.',
  'privacy.data.title': 'Qué datos recopilamos.',
  'privacy.data.body':
    'Los que escribes en el formulario: nombre, correo, teléfono (opcional), empresa (opcional), tipo de proyecto, rango de inversión, plazo y tu mensaje. El formulario no guarda tu dirección IP y nuestro código no usa cookies de seguimiento. En digitalstrike-solutions.com, como en cualquier sitio web, nuestro proveedor de alojamiento (GoDaddy) registra datos técnicos de cada visita, como la dirección IP, por seguridad y funcionamiento del servidor. Sus servidores también agregan a cada página un script de monitoreo de rendimiento que le envía a GoDaddy datos técnicos de la visita (por ejemplo, tiempos de carga y datos del navegador) y guarda cookies de GoDaddy en tu navegador: un identificador de visitante que dura hasta un año y otras que duran la visita. Puedes borrarlas o bloquearlas desde tu navegador sin que el sitio deje de funcionar.',
  'privacy.use.title': 'Para qué los usamos.',
  'privacy.use.body':
    'Usamos los datos del formulario solo para responder a tu solicitud, preparar una propuesta y, si lo pides, agendar una sesión. No los vendemos ni los usamos para publicidad. GoDaddy usa los datos técnicos de la visita para la seguridad, el funcionamiento y el monitoreo de rendimiento de su servicio de alojamiento.',
  'privacy.storage.title': 'Dónde se guardan.',
  'privacy.storage.body':
    'En una hoja de cálculo privada de Google y en el correo de DigitalStrike Solutions. El calendario de Calendly solo se carga cuando tú lo abres (o después de enviar el formulario); desde ese momento Calendly recibe datos técnicos de tu navegador y puede usar sus propias cookies. Si se carga después de enviar el formulario, le pasamos tu nombre y correo para prellenar la cita. Si agendas, procesa los datos de la cita. Estos servicios pueden almacenar datos fuera de Costa Rica.',
  'privacy.retention.title': 'Cuánto tiempo.',
  'privacy.retention.body':
    'Hasta 24 meses desde nuestro último contacto, o hasta que nos pidas borrarlos.',
  'privacy.rights.title': 'Tus derechos.',
  'privacy.rights.body':
    'Conforme a la Ley 8968 puedes pedir acceso, corrección o eliminación de tus datos escribiendo a {contact_email}. Respondemos en un plazo máximo de 5 días hábiles.',
  'privacy.consent.title': 'Tu consentimiento.',
  'privacy.consent.body':
    'Al marcar la casilla del formulario aceptas este uso. Puedes retirarlo en cualquier momento escribiéndonos.',
  'privacy.close': 'Cerrar',
} as const;

export type FormKey = keyof typeof esForm;
