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
} as const;

export type FormKey = keyof typeof esForm;
