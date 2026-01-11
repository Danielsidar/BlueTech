export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category_en: string | null
          category_he: string | null
          excerpt_en: string | null
          excerpt_he: string | null
          id: string
          image_url: string | null
          published_at: string | null
          title_en: string | null
          title_he: string | null
          visibility: string[] | null
        }
        Insert: {
          category_en?: string | null
          category_he?: string | null
          excerpt_en?: string | null
          excerpt_he?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          title_en?: string | null
          title_he?: string | null
          visibility?: string[] | null
        }
        Update: {
          category_en?: string | null
          category_he?: string | null
          excerpt_en?: string | null
          excerpt_he?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          title_en?: string | null
          title_he?: string | null
          visibility?: string[] | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          language: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          language?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          language?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      lesson_qa: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_qa_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_qa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_qa_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lesson_qa"
            referencedColumns: ["id"]
          }
        ]
      },
      courses: {
        Row: {
          agent_id_en: string | null
          agent_id_he: string | null
          ai_mentor_url: string | null
          category: string | null
          course_type: string | null
          created_at: string | null
          demo_video_url: string | null
          description: string | null
          duration_minutes: number | null
          enable_lesson_qa: boolean | null
          external_tool_url: string | null
          has_ai_mentor: boolean | null
          has_certificate: boolean | null
          has_exam: boolean | null
          has_pre_test: boolean | null
          id: string
          image_url: string | null
          is_free: boolean | null
          is_locked: boolean | null
          is_paid: boolean | null
          language: string
          min_pre_test_score: number | null
          payment_url: string | null
          price: number | null
          problem_solved: string | null
          slug: string
          title: string | null
          visibility: string[] | null
        }
        Insert: {
          agent_id_en?: string | null
          agent_id_he?: string | null
          ai_mentor_url?: string | null
          category?: string | null
          course_type?: string | null
          created_at?: string | null
          demo_video_url?: string | null
          description?: string | null
          duration_minutes?: number | null
          enable_lesson_qa?: boolean | null
          external_tool_url?: string | null
          has_ai_mentor?: boolean | null
          has_certificate?: boolean | null
          has_exam?: boolean | null
          has_pre_test?: boolean | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_locked?: boolean | null
          is_paid?: boolean | null
          language?: string
          min_pre_test_score?: number | null
          payment_url?: string | null
          price?: number | null
          problem_solved?: string | null
          slug: string
          title?: string | null
          visibility?: string[] | null
        }
        Update: {
          agent_id_en?: string | null
          agent_id_he?: string | null
          ai_mentor_url?: string | null
          category?: string | null
          course_type?: string | null
          created_at?: string | null
          demo_video_url?: string | null
          description?: string | null
          duration_minutes?: number | null
          enable_lesson_qa?: boolean | null
          external_tool_url?: string | null
          has_ai_mentor?: boolean | null
          has_certificate?: boolean | null
          has_exam?: boolean | null
          has_pre_test?: boolean | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_locked?: boolean | null
          is_paid?: boolean | null
          language?: string
          min_pre_test_score?: number | null
          payment_url?: string | null
          price?: number | null
          problem_solved?: string | null
          slug?: string
          title?: string | null
          visibility?: string[] | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          duration_text: string | null
          has_quiz: boolean | null
          id: string
          lesson_type: string | null
          module_id: string | null
          order_index: number
          title: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          duration_text?: string | null
          has_quiz?: boolean | null
          id?: string
          lesson_type?: string | null
          module_id?: string | null
          order_index: number
          title?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          duration_text?: string | null
          has_quiz?: boolean | null
          id?: string
          lesson_type?: string | null
          module_id?: string | null
          order_index?: number
          title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          order_index: number
          title: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index: number
          title?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          correct_answer_index: number
          course_id: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          options_en: Json | null
          options_he: Json | null
          order_index: number
          question_en: string | null
          question_he: string | null
        }
        Insert: {
          correct_answer_index: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          options_en?: Json | null
          options_he?: Json | null
          order_index: number
          question_en?: string | null
          question_he?: string | null
        }
        Update: {
          correct_answer_index?: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          options_en?: Json | null
          options_he?: Json | null
          order_index?: number
          question_en?: string | null
          question_he?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_access: {
        Row: {
          course_id: string
          enrolled_at: string | null
          is_enrolled: boolean | null
          pre_test_score: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          is_enrolled?: boolean | null
          pre_test_score?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          is_enrolled?: boolean | null
          pre_test_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_access_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_exists: { Args: { email_to_check: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
