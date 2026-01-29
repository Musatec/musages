export interface Project {
  id: string
  title: string
  description: string
  status: 'idee' | 'en_cours' | 'termine' | 'pause' | 'archive'
  progress: number
  tech_stack: string[]
  due_date?: string
  created_at: string
  updated_at?: string
}
