// AUTO-GENERATED — Nicht manuell bearbeiten.
// Basiert auf supabase/migrations/001_initial_schema.sql
// Bei Schema-Änderungen neu generieren:
//   npx supabase gen types typescript --project-id jmytjpzqqspqifkvicwo --schema public > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          theme: 'light' | 'dark' | 'system'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          theme?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          theme?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_lists: {
        Row: {
          id: string
          user_id: string
          title: string
          color: string | null
          icon: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          color?: string | null
          icon?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          color?: string | null
          icon?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_lists_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          list_id: string
          user_id: string
          title: string
          description: string | null
          is_completed: boolean
          completed_at: string | null
          due_date: string | null
          due_time: string | null
          position: number
          priority: 'none' | 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          title: string
          description?: string | null
          is_completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          due_time?: string | null
          position?: number
          priority?: 'none' | 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          due_time?: string | null
          position?: number
          priority?: 'none' | 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_list_id_fkey'
            columns: ['list_id']
            isOneToOne: false
            referencedRelation: 'task_lists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          user_id: string
          title: string
          is_completed: boolean
          completed_at: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          title: string
          is_completed?: boolean
          completed_at?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          title?: string
          is_completed?: boolean
          completed_at?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subtasks_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subtasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      time_entries: {
        Row: {
          id: string
          task_id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          notes: string | null
          is_manual: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          started_at: string
          ended_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          is_manual?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          is_manual?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_entries_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'api_keys_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_timer: {
        Args: { p_user_id: string }
        Returns: {
          entry_id: string
          task_id: string
          started_at: string
        }[]
      }
      get_task_total_duration: {
        Args: { p_task_id: string }
        Returns: number
      }
      reorder_tasks: {
        Args: {
          p_list_id: string
          p_user_id: string
          p_task_ids: string[]
        }
        Returns: undefined
      }
      reorder_lists: {
        Args: {
          p_user_id: string
          p_list_ids: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Convenience-Typen ────────────────────────────────────────────────────────
// Kurzformen für häufig genutzte Row-Typen
export type Profile     = Database['public']['Tables']['profiles']['Row']
export type TaskList    = Database['public']['Tables']['task_lists']['Row']
export type Task        = Database['public']['Tables']['tasks']['Row']
export type Subtask     = Database['public']['Tables']['subtasks']['Row']
export type TimeEntry   = Database['public']['Tables']['time_entries']['Row']
export type ApiKey      = Database['public']['Tables']['api_keys']['Row']

export type ProfileInsert     = Database['public']['Tables']['profiles']['Insert']
export type TaskListInsert    = Database['public']['Tables']['task_lists']['Insert']
export type TaskInsert        = Database['public']['Tables']['tasks']['Insert']
export type SubtaskInsert     = Database['public']['Tables']['subtasks']['Insert']
export type TimeEntryInsert   = Database['public']['Tables']['time_entries']['Insert']

export type ProfileUpdate     = Database['public']['Tables']['profiles']['Update']
export type TaskListUpdate    = Database['public']['Tables']['task_lists']['Update']
export type TaskUpdate        = Database['public']['Tables']['tasks']['Update']
export type SubtaskUpdate     = Database['public']['Tables']['subtasks']['Update']
export type TimeEntryUpdate   = Database['public']['Tables']['time_entries']['Update']

export type Priority = Task['priority']
export type Theme    = Profile['theme']
