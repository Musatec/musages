export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'project' | 'task' | 'milestone'
  description?: string
  color?: string
  projectId?: string
  completed?: boolean
}

export interface ProjectDeadline {
  id: string
  title: string
  deadline: string
  status: 'pending' | 'completed' | 'overdue'
  color: string
}

export interface TaskDeadline {
  id: string
  title: string
  dueDate: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}
