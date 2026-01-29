'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Project } from '@/types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: unknown) {
      toast.error('Erreur lors du chargement des projets')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Projet supprimé avec succès !')
      setProjects(prev => prev.filter(p => p.id !== id))
      return true
    } catch (error: unknown) {
      toast.error('Erreur lors de la suppression du projet')
      console.error('Error deleting project:', error)
      return false
    }
  }

  const duplicateProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id)
      if (!project) throw new Error('Projet non trouvé')

      const { error } = await supabase
        .from('projects')
        .insert({
          title: `${project.title} (copie)`,
          description: project.description,
          status: 'IDEA',
          progress: 0,
          tech_stack: project.tech_stack,
          due_date: project.due_date
        })

      if (error) throw error

      toast.success('Projet dupliqué avec succès !')
      fetchProjects()
      return true
    } catch (error: unknown) {
      toast.error('Erreur lors de la duplication du projet')
      console.error('Error duplicating project:', error)
      return false
    }
  }

  const bulkAction = async (action: string, ids: string[]) => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('projects')
          .delete()
          .in('id', ids)

        if (error) throw error
        setProjects(prev => prev.filter(p => !ids.includes(p.id)))
        toast.success(`${ids.length} projet(s) supprimé(s) avec succès !`)
      } else if (action === 'archive') {
        const { error } = await supabase
          .from('projects')
          .update({ status: 'archive' })
          .in('id', ids)

        if (error) throw error
        fetchProjects()
        toast.success(`${ids.length} projet(s) archivé(s) avec succès !`)
      } else if (action === 'duplicate') {
        const projectsToDuplicate = projects.filter(p => ids.includes(p.id))
        for (const project of projectsToDuplicate) {
          await supabase
            .from('projects')
            .insert({
              title: `${project.title} (copie)`,
              description: project.description,
              status: 'idee',
              progress: 0,
              tech_stack: project.tech_stack,
              due_date: project.due_date
            })
        }
        fetchProjects()
        toast.success(`${ids.length} projet(s) dupliqué(s) avec succès !`)
      } else if (action === 'export') {
        const projectsToExport = projects.filter(p => ids.includes(p.id))
        const csv = [
          ['Titre', 'Description', 'Statut', 'Progression', 'Tech Stack', 'Date d\'échéance'],
          ...projectsToExport.map(p => [
            p.title,
            p.description,
            p.status,
            p.progress.toString(),
            p.tech_stack.join(', '),
            p.due_date || ''
          ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'projects.csv'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export CSV téléchargé avec succès !')
      }
    } catch (error: unknown) {
      toast.error('Erreur lors de l\'action en masse')
      console.error('Error in bulk action:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    fetchProjects,
    deleteProject,
    duplicateProject,
    bulkAction
  }
}
