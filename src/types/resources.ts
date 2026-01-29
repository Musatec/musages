export interface PersonalResource {
  id: string
  user_id: string
  title: string
  content?: string | null
  url?: string | null
  type: 'PROMPT' | 'LINK' | 'IMAGE' | 'IDEA'
  tags: string[]
  created_at: string
}

export interface NewResource {
  title: string
  content?: string
  url?: string
  type: PersonalResource['type']
  tags: string[]
}

export type ResourceType = PersonalResource['type']

export const RESOURCE_TYPES: { value: ResourceType; label: string; description: string }[] = [
  {
    value: 'PROMPT',
    label: 'Prompt',
    description: 'Instructions pour IA, modèles de texte'
  },
  {
    value: 'LINK',
    label: 'Lien',
    description: 'URLs, sites web, outils en ligne'
  },
  {
    value: 'IMAGE',
    label: 'Image',
    description: 'Images, captures d\'écran, visuels'
  },
  {
    value: 'IDEA',
    label: 'Idée',
    description: 'Notes, brainstorming, concepts'
  }
]

export const RESOURCE_CATEGORIES = [
  { value: 'all', label: 'Tous' },
  { value: 'PROMPT', label: 'Prompts' },
  { value: 'LINK', label: 'Liens' },
  { value: 'IMAGE', label: 'Images' },
  { value: 'IDEA', label: 'Idées' }
]
