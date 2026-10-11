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
};
