export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          username: string
          email: string
          whatsapp_number: string | null
          roll_number: string | null
          avatar_url: string | null
          institute: string
          department: string
          semester: string
          bio: string | null
          github_url: string | null
          portfolio_url: string | null
          linkedin_url: string | null
          experience_level: "Beginner" | "Intermediate" | "Advanced"
          role: "student" | "admin"
          profile_completion: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          username: string
          email: string
          whatsapp_number?: string | null
          roll_number?: string | null
          avatar_url?: string | null
          institute: string
          department: string
          semester: string
          bio?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          experience_level?: "Beginner" | "Intermediate" | "Advanced"
          role?: "student" | "admin"
          profile_completion?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          username?: string
          email?: string
          whatsapp_number?: string | null
          roll_number?: string | null
          avatar_url?: string | null
          institute?: string
          department?: string
          semester?: string
          bio?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          linkedin_url?: string | null
          experience_level?: "Beginner" | "Intermediate" | "Advanced"
          role?: "student" | "admin"
          profile_completion?: number
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          created_at?: string
        }
      }
      student_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string | null
          name: string
          category: string
          level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
          progress: number
          target_date: string | null
          learning_goal: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id?: string | null
          name: string
          category: string
          level?: "Beginner" | "Intermediate" | "Advanced" | "Expert"
          progress?: number
          target_date?: string | null
          learning_goal?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string | null
          name?: string
          category?: string
          level?: "Beginner" | "Intermediate" | "Advanced" | "Expert"
          progress?: number
          target_date?: string | null
          learning_goal?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          thumbnail_url: string | null
          tech_stack: string[]
          github_url: string | null
          live_url: string | null
          category: string
          status: "Planning" | "In Progress" | "Completed" | "On Hold"
          created_by: string
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          thumbnail_url?: string | null
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          category: string
          status?: "Planning" | "In Progress" | "Completed" | "On Hold"
          created_by: string
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string | null
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          category?: string
          status?: "Planning" | "In Progress" | "Completed" | "On Hold"
          created_by?: string
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_likes: {
        Row: {
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          created_at?: string
        }
      }
      project_bookmarks: {
        Row: {
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          created_at?: string
        }
      }
      project_comments: {
        Row: {
          id: string
          project_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string
          project_id: string | null
          status: "Planning" | "Recruiting" | "In Progress" | "Completed"
          max_members: number
          required_skills: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          project_id?: string | null
          status?: "Planning" | "Recruiting" | "In Progress" | "Completed"
          max_members?: number
          required_skills?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          project_id?: string | null
          status?: "Planning" | "Recruiting" | "In Progress" | "Completed"
          max_members?: number
          required_skills?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          from_user_id: string
          to_user_id: string
          message: string | null
          status: "pending" | "accepted" | "declined"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          from_user_id: string
          to_user_id: string
          message?: string | null
          status?: "pending" | "accepted" | "declined"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          from_user_id?: string
          to_user_id?: string
          message?: string | null
          status?: "pending" | "accepted" | "declined"
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_members: {
        Row: {
          conversation_id: string
          user_id: string
          last_read_at: string
          joined_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          last_read_at?: string
          joined_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          last_read_at?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          icon: string
          estimated_duration: string
          difficulty: "Beginner" | "Intermediate" | "Advanced"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          icon?: string
          estimated_duration: string
          difficulty: "Beginner" | "Intermediate" | "Advanced"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string
          icon?: string
          estimated_duration?: string
          difficulty?: "Beginner" | "Intermediate" | "Advanced"
          created_at?: string
          updated_at?: string
        }
      }
      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string
          topics: string[]
          resources: Json
          step_order: number
          created_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description: string
          topics?: string[]
          resources?: Json
          step_order: number
          created_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string
          topics?: string[]
          resources?: Json
          step_order?: number
          created_at?: string
        }
      }
      student_roadmap_progress: {
        Row: {
          id: string
          user_id: string
          step_id: string
          completed: boolean
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          step_id: string
          completed?: boolean
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          step_id?: string
          completed?: boolean
          completed_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "invitation" | "message" | "team" | "project" | "system"
          title: string
          description: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "invitation" | "message" | "team" | "project" | "system"
          title: string
          description: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "invitation" | "message" | "team" | "project" | "system"
          title?: string
          description?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          type: "project" | "user" | "comment"
          reason: string
          reported_by: string
          target_id: string
          target_title: string
          status: "pending" | "resolved" | "dismissed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: "project" | "user" | "comment"
          reason: string
          reported_by: string
          target_id: string
          target_title: string
          status?: "pending" | "resolved" | "dismissed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: "project" | "user" | "comment"
          reason?: string
          reported_by?: string
          target_id?: string
          target_title?: string
          status?: "pending" | "resolved" | "dismissed"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
