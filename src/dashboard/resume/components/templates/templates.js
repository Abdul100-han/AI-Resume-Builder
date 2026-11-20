export const DEFAULT_TEMPLATE = 'classic'
export const DEFAULT_THEME = '#0f6b5e'

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Single column, centred header. Safe for any employer or ATS.',
  },
  {
    id: 'modern',
    name: 'Modern Sidebar',
    description: 'Two columns with contact details and skills in a tinted sidebar.',
  },
]

export const templateId = (value) =>
  TEMPLATES.some((t) => t.id === value) ? value : DEFAULT_TEMPLATE
