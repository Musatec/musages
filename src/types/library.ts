export interface PersonalResource {
  id: string
  user_id: string
  title: string
  content?: string | null
  url?: string | null
  type: 'PROMPT' | 'LINK' | 'IMAGE' | 'IDEA'
  category: string
  created_at: string
}

export interface NewResource {
  title: string
  content?: string
  url?: string
  type: PersonalResource['type']
  category?: string
}

export type ResourceType = PersonalResource['type']

export const RESOURCE_TYPES: { value: ResourceType; label: string; description: string; color: string }[] = [
  {
    value: 'PROMPT',
    label: 'Prompt',
    description: 'Instructions pour IA',
    color: 'purple'
  },
  {
    value: 'LINK',
    label: 'Outil IA',
    description: 'Liens et outils',
    color: 'blue'
  },
  {
    value: 'IMAGE',
    label: 'Image',
    description: 'Inspirations visuelles',
    color: 'green'
  },
  {
    value: 'IDEA',
    label: 'Idée',
    description: 'Notes et concepts',
    color: 'yellow'
  }
]

export const FILTER_OPTIONS = [
  { value: 'all', label: 'Tout' },
  { value: 'PROMPT', label: 'Prompts' },
  { value: 'LINK', label: 'Outils IA' },
  { value: 'IDEA', label: 'Idées' },
  { value: 'IMAGE', label: 'Images' }
]
