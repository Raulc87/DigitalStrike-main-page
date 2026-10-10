# CONTENT — DigitalStrike Solutions main page (ES source → EN)

## Metadata
- Version: 0.2
- Status: **Approved** by Raul Casañas — effective when PR #1 is merged (the privacy notice is published as v1 and still gets Cinthia's legal review). v0.2 (2026-10-10): owner answers applied (session 0 free, 2-business-day reply, 24-month retention, Poliart named), success copy and Calendly disclosure fixed after review. Spanish is the source (BR-005); the English column was re-synced with the Spanish on 2026-10-10 and is approved with it. Later changes start in Spanish and are translated in the same PR.
- Owner: Raul Casañas · Drafted by Claude from the Drive material and the CV (2026-10-09)
- Rules: tone sober and approachable; baseball only in the name, logo, slogan and the confirmation email (PROJECT_SPEC §2); no prices (BR-001); no invented proof (BR-002); no refunds (BR-003); inclusive language (BR-006).
- Markers: **[PROVISIONAL]** = shown with a pending badge in preview builds.

Implementation: every visitor-facing string lives in `src/i18n/{es,en}/*.ts`, copied verbatim from this file. Changing copy = change this file first (change management), then the dictionaries.

---

## 1. Site metadata (SEO)

| Key | ES | EN |
|---|---|---|
| `meta.title` | DigitalStrike Solutions · Software a la medida para tu negocio | DigitalStrike Solutions · Custom software for your business |
| `meta.description` | Páginas web, aplicaciones y sistemas a la medida para personas emprendedoras y empresas. Trabajamos cerca de ti, desde Costa Rica para el mundo. | Websites, web apps and custom systems for entrepreneurs and companies. We work close to you, from Costa Rica to the world. |
| `meta.og_alt` | Logo de DigitalStrike Solutions: una bola de béisbol con un cursor de terminal | DigitalStrike Solutions logo: a baseball with a terminal cursor |

## 2. Header

| Key | ES | EN |
|---|---|---|
| `nav.services` | Servicios | Services |
| `nav.process` | Cómo trabajamos | How we work |
| `nav.work` | Proyectos | Work |
| `nav.about` | Nosotros | About |
| `nav.contact` | Contacto | Contact |
| `nav.cta` | Agenda tu sesión 0 | Book session 0 |
| `nav.menu_open` / `nav.menu_close` | Abrir menú / Cerrar menú | Open menu / Close menu |
| `lang.toggle_label` | Cambiar idioma | Change language |
| `skip_link` | Saltar al contenido | Skip to content |

## 3. Hero (`#inicio`)

| Key | ES | EN |
|---|---|---|
| `hero.eyebrow` | Software a la medida · Desde Costa Rica para el mundo | Custom software · From Costa Rica to the world |
| `hero.title` | Soluciones de software que se adaptan a tu negocio, no al revés. | Software solutions that adapt to your business, not the other way around. |
| `hero.subtitle` | Desde tu primera página web hasta el sistema que ordena tu empresa. Trabajamos cerca de ti y ajustamos el rumbo cuando tu negocio lo necesita. | From your first website to the system that runs your company. We work close to you and adjust course whenever your business needs it. |
| `hero.slogan` | Sacamos de circulación tus necesidades de software. | We strike out your software needs. |
| `hero.cta_primary` | Cuéntanos tu idea | Tell us your idea |
| `hero.cta_secondary` | Agenda tu sesión 0 | Book session 0 |

## 4. Why DigitalStrike (value strip, inside hero or right after it)

| Key | ES | EN |
|---|---|---|
| `value.1.title` | Cercanía real | Real closeness |
| `value.1.body` | Hablas directamente con quien construye tu solución. Participas en cada etapa y ves avances desde el inicio. | You talk directly to the people building your solution. You take part in every stage and see progress from the start. |
| `value.2.title` | Nos adaptamos al cambio | We adapt to change |
| `value.2.body` | Si tu negocio cambia mientras construimos, el software cambia con él. Ajustamos el plan contigo. | If your business changes while we build, the software changes with it. We adjust the plan with you. |
| `value.3.title` | Experiencia probada | Proven experience |
| `value.3.body` | Más de 17 años construyendo plataformas para empresas como Google, Sephora, Experian y Wells Fargo, ahora al servicio de tu proyecto. | 17+ years building platforms for companies like Google, Sephora, Experian and Wells Fargo, now working on your project. |

## 5. Services (`#servicios`)

| Key | ES | EN |
|---|---|---|
| `services.title` | Lo que construimos | What we build |
| `services.intro` | Cada proyecto es distinto, por eso cada propuesta se arma según tu alcance. Estos son los tipos de proyecto que hacemos con más frecuencia. | Every project is different, so every proposal is shaped around your scope. These are the kinds of projects we build most often. |
| `services.card_cta` | Quiero algo así | I want something like this |
| `services.note` | No publicamos precios fijos: te enviamos una propuesta clara después de entender lo que necesitas. | We don't publish fixed prices: you get a clear proposal once we understand what you need. |

Cards (the `card_cta` scrolls to `#contacto` and preselects `project_type`):

| # | `project_type` | Title ES / EN | For whom ES / EN | Includes ES / EN |
|---|---|---|---|---|
| A | `website` | Presencia web / Web presence | Personas emprendedoras y marcas que necesitan una página profesional que venda. / Entrepreneurs and brands that need a professional page that sells. | Página de una sola vista, enfocada en convertir · Diseño pensado primero para celular · Español e inglés si lo necesitas · Formulario de contacto · Publicación en tu dominio / One-page site focused on converting · Mobile-first design · Spanish and English if you need them · Contact form · Published on your domain |
| B | `web_app` | Aplicaciones web / Web apps | Negocios que necesitan algo más que una vitrina: catálogos, agendas, cursos o pedidos. / Businesses that need more than a storefront: catalogues, bookings, courses or orders. | Funcionalidades a la medida como catálogo, carrito o formulario de captación · Panel para administrar tu contenido · Integración con las herramientas que ya usas / Tailored features such as a catalogue, cart or lead funnel · A panel to manage your content · Integration with the tools you already use |
| C | `business_system` | Sistemas para empresas / Business systems | Empresas que pierden tiempo o dinero en procesos manuales, inventarios o reportes. / Companies losing time or money on manual processes, inventory or reporting. | Inventario, reportería y automatización de procesos · Frontend y backend a la medida · Entregas progresivas para que veas avances / Inventory, reporting and process automation · Custom front end and back end · Progressive deliveries so you see progress |
| D | `custom_solution` | Soluciones a la medida / Tailor-made solutions | Problemas poco convencionales que piden pensar fuera de la caja. / Unconventional problems that call for out-of-the-box thinking. | Varias tecnologías trabajando juntas · Integración de datos e inteligencia artificial aplicada · Arquitectura pensada para crecer / Several technologies working together · Data integration and applied AI · Architecture designed to grow |
| + | `custom_solution` | Mejoras y personalizaciones / Improvements and customisations | ¿Ya tienes un sistema? Lo extendemos, lo integramos o lo modernizamos. / Already have a system? We extend, integrate or modernise it. | Nuevas funcionalidades · Integraciones · Migraciones y mejoras de rendimiento / New features · Integrations · Migrations and performance improvements |

## 6. How we work (`#como-trabajamos`)

| Key | ES | EN |
|---|---|---|
| `process.title` | Cómo trabajamos | How we work |
| `process.intro` | Un proceso claro, con tu participación en cada paso. | A clear process, with you involved at every step. |
| `process.1.title` | Sesión 0 | Session 0 |
| `process.1.body` | Conversamos una hora sobre tu problema o tu idea. Es gratuita y sin compromiso. | We spend one hour on your problem or idea. It's free, with no commitment. |
| `process.2.title` | Propuesta y alcance | Proposal and scope |
| `process.2.body` | Te enviamos una propuesta con el alcance por escrito, las entregas y cómo vamos a validar cada una. | You receive a proposal with the written scope, the deliveries and how each one will be validated. |
| `process.3.title` | Construimos por entregas | We build in deliveries |
| `process.3.body` | Ves avances reales, opinas y ajustamos el rumbo juntos. Nada de sorpresas al final. | You see real progress, give feedback and we adjust course together. No surprises at the end. |
| `process.4.title` | Lanzamiento y acompañamiento | Launch and support |
| `process.4.body` | Publicamos tu solución y te seguimos acompañando después del lanzamiento. | We launch your solution and keep supporting you after release. |
| `warranty.title` | Garantía de 6 meses en todos los proyectos | 6-month warranty on every project |
| `warranty.body` | Si aparece un error en lo que acordamos, lo corregimos sin costo durante los seis meses siguientes al lanzamiento. | If a defect shows up in what we agreed on, we fix it at no cost for six months after launch. |

## 7. Showroom (`#proyectos`)

| Key | ES | EN |
|---|---|---|
| `work.title` | Proyectos de nuestro equipo | Our team's work |
| `work.intro` | Algunos proyectos construidos por nuestro equipo. Pronto sumaremos más casos. | A few projects built by our team. More cases coming soon. |
| `work.repo_link` | Ver código en GitHub | View code on GitHub |
| `work.private` | Caso de estudio · código privado | Case study · private code |

| # | Repo | Title ES / EN | Description ES / EN | Tags |
|---|---|---|---|---|
| 1 | `https://github.com/Raulc87/gaby-main-page` | Página de captación para un programa de salud financiera / Lead-generation page for a financial-health programme | Página bilingüe que presenta la oferta, filtra a las personas interesadas con una pregunta y guarda cada contacto en Google Sheets antes de abrir la agenda. / A bilingual page that presents the offer, screens interested people with one question and saves every lead to Google Sheets before opening the booking calendar. | Astro · TypeScript · Python · Google Sheets · Calendly · Playwright |
| 2 | `https://github.com/Raulc87/cami-main-page` | Sitio de marca personal para una conferencista y coach / Personal-brand site for a speaker and coach | Sitio de una página, bilingüe, con secciones animadas y cambio de idioma al instante. / A bilingual one-page site with animated sections and instant language switching. | React · Vite · JavaScript · CSS |
| 3 | private — no link (Poliart agreed to be named, 2026-10-10) | Plataforma de reportes con IA para Poliart Impresores / AI reporting platform for Poliart Impresores | La gerencia pide reportes en lenguaje natural y los recibe en segundos, en lugar de esperar de 5 a 10 días. Unifica 3 bases de datos y limita la IA a un catálogo de reportes aprobados y auditables. / Management asks for reports in plain language and gets them in seconds instead of waiting 5 to 10 days. It unifies 3 databases and limits the AI to a catalogue of approved, auditable reports. | Python · React · Claude · Docker |

Images: a screenshot per project if available (Agent 1 may build the public repos locally and capture a 1200×750 screenshot); otherwise a neutral card header with the project's initials. **[PROVISIONAL]**

## 8. About the CEO (`#nosotros`)

| Key | ES | EN |
|---|---|---|
| `about.title` | La persona detrás de DigitalStrike | The person behind DigitalStrike |
| `about.name` | Raul Casañas | Raul Casañas |
| `about.role` | CEO y fundador | CEO and founder |
| `about.p1` | Desarrollo software desde 2009. En más de 17 años he construido plataformas empresariales de punta a punta para compañías como Google, Sephora, Experian, Wells Fargo y TreviPay: desde el módulo de inventario de las tiendas de Google hasta servicios de pagos B2B que procesan más de US$6.000 millones al año. | I've been building software since 2009. In 17+ years I've built enterprise platforms end to end for companies like Google, Sephora, Experian, Wells Fargo and TreviPay: from the inventory module of Google's stores to B2B payment services processing over US$6 billion a year. |
| `about.p2` | Mi especialidad es que los sistemas lentos se vuelvan rápidos y que el trabajo manual desaparezca: he llevado tiempos de respuesta de minutos a milisegundos, he liderado migraciones críticas sin perder un solo dato y hoy integro inteligencia artificial de forma segura y auditable. | My speciality is making slow systems fast and making manual work disappear: I've taken response times from minutes to milliseconds, led critical migrations without losing a single record, and today I integrate AI in a safe, auditable way. |
| `about.p3` | Fundé DigitalStrike para dejar de vender horas y empezar a resolver problemas, los tuyos, con la misma calidad que exigen las grandes compañías. El nombre viene del béisbol, que jugué de joven: aquí sacamos de circulación tus necesidades de software. | I founded DigitalStrike to stop selling hours and start solving problems, yours, with the quality big companies demand. The name comes from baseball, which I played growing up: here, we strike out your software needs. |
| `about.facts` (chips) | 17+ años de experiencia · Equipos de hasta 8 personas liderados · Java · Python · React · TypeScript · AWS · IA aplicada · Scrum Master certificado (PSM I) · Español e inglés | 17+ years of experience · Led teams of up to 8 engineers · Java · Python · React · TypeScript · AWS · Applied AI · Certified Scrum Master (PSM I) · Spanish and English |
| `about.linkedin` | Ver perfil en LinkedIn | View LinkedIn profile |
| `about.photo_alt` | Raul Casañas, CEO de DigitalStrike Solutions | Raul Casañas, CEO of DigitalStrike Solutions |

Photo: **[PROVISIONAL]** `docs/assets/photos/raul-casanas-200.jpg` (200×200 px, supplied by Raul 2026-10-10). Display it at most 200 CSS px wide until a ≥ 800×800 px version replaces it; the monogram "RC" is the fallback if the file is missing.

## 9. Clients (`#clientes`, behind `PUBLIC_SHOW_CLIENT_LOGOS`)

| Key | ES | EN |
|---|---|---|
| `clients.title` | Empresas que confían en nosotros | Companies that trust us |
| `clients.slot` | Este espacio está reservado para tu marca | This space is reserved for your brand |

Four dashed placeholder slots, each with `clients.slot` as text. No real names or logos (BR-002, BR-004).

## 10. Lead form (`#contacto`)

| Key | ES | EN |
|---|---|---|
| `form.title` | Cuéntanos tu idea | Tell us your idea |
| `form.intro` | Responde unas preguntas rápidas. Te escribimos en un máximo de 2 días hábiles. | Answer a few quick questions. We'll reply within 2 business days. |
| `form.required_note` | Los campos con * son obligatorios. | Fields marked * are required. |
| `form.name.label` | Nombre * | Name * |
| `form.email.label` | Correo electrónico * | Email * |
| `form.phone.label` | Teléfono o WhatsApp (opcional) | Phone or WhatsApp (optional) |
| `form.phone.hint` | Incluye el código de país, por ejemplo +506 8888 0000. | Include the country code, e.g. +1 555 123 4567. |
| `form.company.label` | Empresa o marca (opcional) | Company or brand (optional) |
| `form.project_type.label` | ¿Qué necesitas? * | What do you need? * |
| `form.budget_range.label` | ¿Cuánto planeas invertir? * | How much do you plan to invest? * |
| `form.budget_range.hint` | Nos ayuda a proponerte la mejor solución para tu presupuesto. | It helps us propose the best solution for your budget. |
| `form.timeline.label` | ¿Para cuándo lo necesitas? * | When do you need it? * |
| `form.message.label` | Cuéntanos el problema o la idea * | Tell us about the problem or idea * |
| `form.message.hint` | Qué quieres lograr, para quién y qué has intentado hasta ahora. Mínimo 20 caracteres. | What you want to achieve, for whom, and what you've tried so far. At least 20 characters. |
| `form.select_placeholder` | Elige una opción | Choose an option |
| `form.consent.label` | Acepto que DigitalStrike Solutions use mis datos para responder a mi solicitud, según el aviso de privacidad. * | I agree that DigitalStrike Solutions may use my data to answer my request, as described in the privacy notice. * |
| `form.consent.link` | Leer el aviso de privacidad | Read the privacy notice |
| `form.submit` | Enviar mi idea | Send my idea |
| `form.submitting` | Enviando… | Sending… |
| `form.success.title` | ¡Recibido, {first_name}! | Got it, {first_name}! |
| `form.success.body` | Ya tenemos tu idea. Te escribiremos en un máximo de 2 días hábiles. Si quieres adelantar, agenda tu sesión 0 aquí abajo. | We have your idea. We'll write to you within 2 business days. If you'd like to move faster, book your session 0 below. |
| `form.success.cta` | Agendar mi sesión 0 | Book my session 0 |

Option labels: exactly as `docs/specs/LEAD_ENDPOINT_CONTRACT.md` §4.

Errors:

| Code | ES | EN |
|---|---|---|
| `required` | Este campo es obligatorio. | This field is required. |
| `too_short` (name) | Escribe al menos 2 caracteres. | Enter at least 2 characters. |
| `too_short` (message) | Cuéntanos un poco más (mínimo 20 caracteres). | Tell us a bit more (at least 20 characters). |
| `too_long` | Es demasiado largo. | This is too long. |
| `invalid_format` (name) | Usa solo letras, espacios, apóstrofos, guiones o puntos. | Use only letters, spaces, apostrophes, hyphens or periods. |
| `invalid_format` (email) | Revisa el correo, por ejemplo nombre@ejemplo.com. | Check the email, e.g. name@example.com. |
| `invalid_format` (phone) | Revisa el número, por ejemplo +506 8888 0000. | Check the number, e.g. +1 555 123 4567. |
| `invalid_option` | Elige una de las opciones. | Choose one of the options. |
| `must_be_true` | Necesitamos tu consentimiento para responderte. | We need your consent to reply. |
| `rate_limited` | En este momento no podemos recibir más mensajes por aquí. Inténtalo más tarde o escríbenos directamente a {email}. | We can't take more messages here right now. Please try again later or email us directly at {email}. |
| `generic` (storage_unavailable, internal_error, invalid_json, payload_too_large, network) | No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a {email}. | We couldn't send your message. Please try again or email us at {email}. |
| `form.error_summary` | Revisa los campos marcados. | Please check the highlighted fields. |

## 11. Scheduling (`#agenda`)

| Key | ES | EN |
|---|---|---|
| `schedule.title` | Agenda tu sesión 0 | Book your session 0 |
| `schedule.body` | Una conversación de una hora para entender tu problema y ver si somos el equipo indicado para resolverlo. | A one-hour conversation to understand your problem and see if we're the right team to solve it. |
| `schedule.fallback` | ¿No ves el calendario? Ábrelo en una pestaña nueva. | Can't see the calendar? Open it in a new tab. |
| `schedule.loading` | Cargando el calendario… | Loading the calendar… |
| `schedule.open` | Ver horarios disponibles | See available times |
| `schedule.notice` | Al abrir el calendario se carga Calendly, un servicio externo. Más detalles en el aviso de privacidad. | Opening the calendar loads Calendly, an external service. More details in the privacy notice. |

## 12. Footer

| Key | ES | EN |
|---|---|---|
| `footer.slogan` | Sacamos de circulación tus necesidades de software. | We strike out your software needs. |
| `footer.location` | San José, Costa Rica · Trabajamos con clientes en todo el mundo | San José, Costa Rica · Working with clients worldwide |
| `footer.email_label` | Escríbenos | Email us |
| `footer.linkedin` | LinkedIn | LinkedIn |
| `footer.privacy` | Aviso de privacidad | Privacy notice |
| `footer.copyright` | © 2026 DigitalStrike Solutions. Todos los derechos reservados. | © 2026 DigitalStrike Solutions. All rights reserved. |

## 13. Privacy notice (dialog from the form + page `/es/privacidad/`, `/en/privacy/`)

Version `2026-10-14-v1`. **Draft pending legal review (Cinthia Hernández).** Shown publicly with its version and date.

### ES
**Aviso de privacidad — DigitalStrike Solutions**
Versión 2026-10-14-v1

**Quién es responsable de tus datos.** Raul Casañas, quien opera bajo la marca DigitalStrike Solutions en San José, Costa Rica. Contacto: {contact_email}.

**Qué datos recopilamos.** Los que escribes en el formulario: nombre, correo, teléfono (opcional), empresa (opcional), tipo de proyecto, rango de inversión, plazo y tu mensaje. El formulario no guarda tu dirección IP y el sitio no usa cookies de seguimiento. Como en cualquier sitio web, nuestro proveedor de alojamiento (GoDaddy) registra datos técnicos de cada visita, como la dirección IP, por seguridad y funcionamiento del servidor.

**Para qué los usamos.** Solo para responder a tu solicitud, preparar una propuesta y, si lo pides, agendar una sesión. No los vendemos ni los usamos para publicidad.

**Dónde se guardan.** En una hoja de cálculo privada de Google y en el correo de DigitalStrike Solutions. El calendario de Calendly solo se carga cuando tú lo abres (o después de enviar el formulario); desde ese momento Calendly recibe datos técnicos de tu navegador y puede usar sus propias cookies. Si se carga después de enviar el formulario, le pasamos tu nombre y correo para prellenar la cita. Si agendas, procesa los datos de la cita. Estos servicios pueden almacenar datos fuera de Costa Rica.

**Cuánto tiempo.** Hasta 24 meses desde nuestro último contacto, o hasta que nos pidas borrarlos.

**Tus derechos.** Conforme a la Ley 8968 puedes pedir acceso, corrección o eliminación de tus datos escribiendo a {contact_email}. Respondemos en un plazo máximo de 5 días hábiles.

**Tu consentimiento.** Al marcar la casilla del formulario aceptas este uso. Puedes retirarlo en cualquier momento escribiéndonos.

### EN
**Privacy notice — DigitalStrike Solutions**
Version 2026-10-14-v1

**Who is responsible for your data.** Raul Casañas, operating under the brand DigitalStrike Solutions in San José, Costa Rica. Contact: {contact_email}.

**What we collect.** What you type in the form: name, email, phone (optional), company (optional), project type, investment range, timeline and your message. The form doesn't store your IP address and the site doesn't use tracking cookies. As with any website, our hosting provider (GoDaddy) logs technical data about each visit, such as the IP address, for security and server operation.

**What we use it for.** Only to answer your request, prepare a proposal and, if you ask, schedule a session. We don't sell it or use it for advertising.

**Where it is stored.** In a private Google spreadsheet and in DigitalStrike Solutions' email. The Calendly calendar only loads when you open it (or after you submit the form); from then on Calendly receives technical data from your browser and may set its own cookies. If it loads after you submit the form, we pass it your name and email to prefill the booking. If you book, it processes the booking data. These services may store data outside Costa Rica.

**How long.** Up to 24 months from our last contact, or until you ask us to delete it.

**Your rights.** Under Costa Rica's Law 8968 you can request access to, correction or deletion of your data by writing to {contact_email}. We reply within 5 business days.

**Your consent.** By ticking the form's checkbox you agree to this use. You can withdraw it at any time by writing to us.

## 14. Emails (Apps Script, ADR-005)

Plain, well-structured HTML with a plain-text alternative. Brand colours via inline styles; no images required (logo optional as hosted PNG later).

### 14.1 Owner notification — "cover letter" (always in Spanish)

- **Subject:** `Nuevo prospecto {lead_id}: {name} · {project_type_label_es} · {budget_range_label_es}`
- **Reply-To:** the visitor's email
- **Body:**

> Raul:
>
> **{name}** dejó su idea en la página ({language_label}). Estos son sus datos:
>
> | | |
> |---|---|
> | Correo | {email} |
> | Teléfono | {phone or "—"} |
> | Empresa | {company or "—"} |
> | Necesita | {project_type_label_es} |
> | Inversión | {budget_range_label_es} |
> | Plazo | {timeline_label_es} |
> | Recibido | {submitted_at} (hora de Costa Rica) |
>
> **Su mensaje:**
> {message}
>
> Responde a este correo para escribirle directamente. El prospecto quedó en la hoja con estado `new`.
>
> — Formulario de DigitalStrike Solutions · {lead_id}

### 14.2 Visitor confirmation (in the visitor's language)

**ES**
- **Subject:** `Tu idea ya está en juego · DigitalStrike Solutions`
- **Body:**

> Hola, {first_name}:
>
> Gracias por contarnos tu idea. Ya la recibimos y la estamos revisando con calma.
>
> **Así sigue el juego:**
> 1. Revisamos lo que nos contaste y preparamos preguntas concretas.
> 2. Te escribimos en un máximo de 2 días hábiles.
> 3. Si prefieres adelantar, agenda tu sesión 0: {calendly_url}
>
> Nuestro trabajo es sencillo de explicar: sacar de circulación tus necesidades de software.
>
> Raul Casañas
> CEO, DigitalStrike Solutions
>
> ---
> **Resumen de lo que nos enviaste:** {project_type_label} · {budget_range_label} · {timeline_label}
> «{message}»
>
> Recibiste este correo porque completaste el formulario en {site_url}. Si no fuiste tú, ignóralo o escríbenos para borrar tus datos.

**EN**
- **Subject:** `Your idea is in play · DigitalStrike Solutions`
- **Body:**

> Hi {first_name},
>
> Thanks for telling us about your idea. We've received it and we're reviewing it carefully.
>
> **Here's the game plan:**
> 1. We review what you shared and prepare specific questions.
> 2. We'll write to you within 2 business days.
> 3. If you'd like to move faster, book your session 0: {calendly_url}
>
> Our job is simple to explain: we strike out your software needs.
>
> Raul Casañas
> CEO, DigitalStrike Solutions
>
> ---
> **Summary of what you sent:** {project_type_label} · {budget_range_label} · {timeline_label}
> "{message}"
>
> You received this email because you filled in the form at {site_url}. If it wasn't you, ignore it or write to us to delete your data.

`{first_name}` = first word of the normalized `name`.

## 15. Pending badge

| Key | ES | EN |
|---|---|---|
| `pending.badge` | Contenido provisional | Provisional content |

Shown next to every **[PROVISIONAL]** item only when `PUBLIC_SHOW_PENDING_BADGES=true`.
