// English column of docs/ux/CONTENT.md §10 and LEAD_ENDPOINT_CONTRACT.md §4, verbatim.
// Must have exactly the keys of the Spanish source.
import type { FormKey } from '../es/form';

export const enForm: Record<FormKey, string> = {
  'form.title': 'Tell us your idea',
  'form.intro': "Answer a few quick questions. We'll reply within 2 business days.",
  'form.required_note': 'Fields marked * are required.',
  'form.name.label': 'Name *',
  'form.email.label': 'Email *',
  'form.phone.label': 'Phone or WhatsApp (optional)',
  'form.phone.hint': 'Include the country code, e.g. +1 555 123 4567.',
  'form.company.label': 'Company or brand (optional)',
  'form.project_type.label': 'What do you need? *',
  'form.budget_range.label': 'How much do you plan to invest? *',
  'form.budget_range.hint': 'It helps us propose the best solution for your budget.',
  'form.timeline.label': 'When do you need it? *',
  'form.message.label': 'Tell us about the problem or idea *',
  'form.message.hint':
    "What you want to achieve, for whom, and what you've tried so far. At least 20 characters.",
  'form.select_placeholder': 'Choose an option',
  'form.consent.label':
    'I agree that DigitalStrike Solutions may use my data to answer my request, as described in the privacy notice. *',
  'form.consent.link': 'Read the privacy notice',
  'form.submit': 'Send my idea',
  'form.submitting': 'Sending…',
  'form.success.title': 'Got it, {first_name}!',
  'form.success.body':
    "We have your idea. We'll write to you within 2 business days. If you'd like to move faster, book your session 0 below.",
  'form.success.cta': 'Book my session 0',

  'form.project_type.website': 'Website',
  'form.project_type.web_app': 'Web app (catalogue, bookings, courses…)',
  'form.project_type.business_system': 'Business system (inventory, reporting, processes)',
  'form.project_type.custom_solution': 'Custom solution / something unusual',
  'form.project_type.not_sure': 'Not sure yet',
  'form.budget_range.under_1000': 'Under US$1,000',
  'form.budget_range.from_1000_to_3000': 'US$1,000 – 3,000',
  'form.budget_range.from_3000_to_10000': 'US$3,000 – 10,000',
  'form.budget_range.from_10000_to_25000': 'US$10,000 – 25,000',
  'form.budget_range.over_25000': 'Over US$25,000',
  'form.budget_range.not_sure': 'Not defined yet',
  'form.timeline.asap': 'As soon as possible',
  'form.timeline.within_1_month': 'Within a month',
  'form.timeline.within_3_months': 'Within 3 months',
  'form.timeline.flexible': 'Flexible',

  'form.error.required': 'This field is required.',
  'form.error.too_short.name': 'Enter at least 2 characters.',
  'form.error.too_short.message': 'Tell us a bit more (at least 20 characters).',
  'form.error.too_long': 'This is too long.',
  'form.error.invalid_format.name': 'Use only letters, spaces, apostrophes, hyphens or periods.',
  'form.error.invalid_format.email': 'Check the email, e.g. name@example.com.',
  'form.error.invalid_format.phone': 'Check the number, e.g. +1 555 123 4567.',
  'form.error.invalid_option': 'Choose one of the options.',
  'form.error.must_be_true': 'We need your consent to reply.',
  'form.error.rate_limited':
    "We can't take more messages here right now. Please try again later or email us directly at {email}.",
  'form.error.generic': "We couldn't send your message. Please try again or email us at {email}.",
  'form.error_summary': 'Please check the highlighted fields.',
  'schedule.title': 'Book your session 0',
  'schedule.body':
    "A one-hour conversation to understand your problem and see if we're the right team to solve it.",
  'schedule.fallback': "Can't see the calendar? Open it in a new tab.",
  'schedule.loading': 'Loading the calendar…',
  'schedule.open': 'See available times',
  'schedule.notice':
    'Opening the calendar loads Calendly, an external service. More details in the privacy notice.',

  'privacy.title': 'Privacy notice — DigitalStrike Solutions',
  'privacy.version': 'Version {version}',
  'privacy.controller.title': 'Who is responsible for your data.',
  'privacy.controller.body':
    'Raul Casañas, operating under the brand DigitalStrike Solutions in San José, Costa Rica. Contact: {contact_email}.',
  'privacy.data.title': 'What we collect.',
  'privacy.data.body':
    "What you type in the form: name, email, phone (optional), company (optional), project type, investment range, timeline and your message. The form doesn't store your IP address and our code doesn't use tracking cookies. On digitalstrike-solutions.com, as with any website, our hosting provider (GoDaddy) logs technical data about each visit, such as the IP address, for security and server operation. Its servers also add a performance monitoring script to every page, which sends GoDaddy technical data about the visit (for example, load times and browser data) and stores GoDaddy cookies in your browser: a visitor identifier that lasts up to one year and others that last for the visit. You can delete or block them in your browser and the site keeps working.",
  'privacy.use.title': 'What we use it for.',
  'privacy.use.body':
    "We use the form data only to answer your request, prepare a proposal and, if you ask, schedule a session. We don't sell it or use it for advertising. GoDaddy uses the technical visit data for the security, operation and performance monitoring of its hosting service.",
  'privacy.storage.title': 'Where it is stored.',
  'privacy.storage.body':
    "In a private Google spreadsheet and in DigitalStrike Solutions' email. The Calendly calendar only loads when you open it (or after you submit the form); from then on Calendly receives technical data from your browser and may set its own cookies. If it loads after you submit the form, we pass it your name and email to prefill the booking. If you book, it processes the booking data. These services may store data outside Costa Rica.",
  'privacy.retention.title': 'How long.',
  'privacy.retention.body':
    "Up to 24 months from our last contact, or until you ask us to delete it. When we delete your data, the Google spreadsheet's version history may still show it; we don't use that history for anything.",
  'privacy.rights.title': 'Your rights.',
  'privacy.rights.body':
    "Under Costa Rica's Law 8968 you can request access to, correction or deletion of your data by writing to {contact_email}. We reply within 5 business days.",
  'privacy.consent.title': 'Your consent.',
  'privacy.consent.body':
    "By ticking the form's checkbox you agree to this use. You can withdraw it at any time by writing to us.",
  'privacy.close': 'Close',
};
