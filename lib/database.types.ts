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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          config: Json
          created_at: string
          id: string
          industry: string | null
          invite_code: string | null
          name: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          industry?: string | null
          invite_code?: string | null
          name: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          industry?: string | null
          invite_code?: string | null
          name?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          page_number: number | null
          topic_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          topic_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      document_holders: {
        Row: {
          assigned_at: string
          document_id: string
          knowledge_holder_id: string
        }
        Insert: {
          assigned_at?: string
          document_id: string
          knowledge_holder_id: string
        }
        Update: {
          assigned_at?: string
          document_id?: string
          knowledge_holder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_holders_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_holders_knowledge_holder_id_fkey"
            columns: ["knowledge_holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_topics: {
        Row: {
          created_at: string
          document_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_topics_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string
          doc_type: string | null
          id: string
          name: string
          status: string
          storage_path: string | null
          uploaded_at: string
        }
        Insert: {
          company_id: string
          doc_type?: string | null
          id?: string
          name: string
          status?: string
          storage_path?: string | null
          uploaded_at?: string
        }
        Update: {
          company_id?: string
          doc_type?: string | null
          id?: string
          name?: string
          status?: string
          storage_path?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      gap_flags: {
        Row: {
          description: string
          detected_at: string
          holder_id: string
          id: string
          resolved_at: string | null
          severity: string
          status: string
          topic_id: string | null
        }
        Insert: {
          description: string
          detected_at?: string
          holder_id: string
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          topic_id?: string | null
        }
        Update: {
          description?: string
          detected_at?: string
          holder_id?: string
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gap_flags_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gap_flags_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      holder_topics: {
        Row: {
          holder_id: string
          priority: number
          topic_id: string
        }
        Insert: {
          holder_id: string
          priority?: number
          topic_id: string
        }
        Update: {
          holder_id?: string
          priority?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holder_topics_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holder_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          auth_user_id: string
          company_id: string
          created_at: string
          id: string
          requester_email: string
          requester_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          auth_user_id: string
          company_id: string
          created_at?: string
          id?: string
          requester_email: string
          requester_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          auth_user_id?: string
          company_id?: string
          created_at?: string
          id?: string
          requester_email?: string
          requester_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          capture_source: string
          chunk_type: string
          confidence: number
          content: string
          created_at: string
          embedding: string | null
          holder_id: string
          id: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          session_id: string | null
          source_quote: string | null
          topic_id: string | null
        }
        Insert: {
          capture_source: string
          chunk_type: string
          confidence?: number
          content: string
          created_at?: string
          embedding?: string | null
          holder_id: string
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          source_quote?: string | null
          topic_id?: string | null
        }
        Update: {
          capture_source?: string
          chunk_type?: string
          confidence?: number
          content?: string
          created_at?: string
          embedding?: string | null
          holder_id?: string
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          source_quote?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_holders: {
        Row: {
          capture_mode: string
          company_id: string
          created_at: string
          department: string | null
          domains: string[]
          id: string
          knowledge_completeness: number
          name: string
          retiring_at: string | null
          role: string | null
          status: string
          team_member_id: string | null
          tenure_years: number | null
        }
        Insert: {
          capture_mode?: string
          company_id: string
          created_at?: string
          department?: string | null
          domains?: string[]
          id?: string
          knowledge_completeness?: number
          name: string
          retiring_at?: string | null
          role?: string | null
          status?: string
          team_member_id?: string | null
          tenure_years?: number | null
        }
        Update: {
          capture_mode?: string
          company_id?: string
          created_at?: string
          department?: string | null
          domains?: string[]
          id?: string
          knowledge_completeness?: number
          name?: string
          retiring_at?: string | null
          role?: string | null
          status?: string
          team_member_id?: string | null
          tenure_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_holders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_holders_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_knowledge_overlap: {
        Row: {
          holder_id: string
          last_computed: string
          member_id: string
          overlap_score: number
          topic_ids: string[]
        }
        Insert: {
          holder_id: string
          last_computed?: string
          member_id: string
          overlap_score?: number
          topic_ids?: string[]
        }
        Update: {
          holder_id?: string
          last_computed?: string
          member_id?: string
          overlap_score?: number
          topic_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "member_knowledge_overlap_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_knowledge_overlap_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          agent_answer: string | null
          agent_confidence: number | null
          answered_at: string | null
          answered_by_chunk_id: string | null
          asked_by: string
          company_id: string
          content: string
          created_at: string
          human_answer: string | null
          id: string
          routed_to: string | null
          spawned_chunk_id: string | null
          status: string
          topic_id: string | null
        }
        Insert: {
          agent_answer?: string | null
          agent_confidence?: number | null
          answered_at?: string | null
          answered_by_chunk_id?: string | null
          asked_by: string
          company_id: string
          content: string
          created_at?: string
          human_answer?: string | null
          id?: string
          routed_to?: string | null
          spawned_chunk_id?: string | null
          status?: string
          topic_id?: string | null
        }
        Update: {
          agent_answer?: string | null
          agent_confidence?: number | null
          answered_at?: string | null
          answered_by_chunk_id?: string | null
          asked_by?: string
          company_id?: string
          content?: string
          created_at?: string
          human_answer?: string | null
          id?: string
          routed_to?: string | null
          spawned_chunk_id?: string | null
          status?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_answered_by_chunk_id_fkey"
            columns: ["answered_by_chunk_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_asked_by_fkey"
            columns: ["asked_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_routed_to_fkey"
            columns: ["routed_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_spawned_chunk_id_fkey"
            columns: ["spawned_chunk_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          focus_topics: string[]
          holder_id: string
          id: string
          scheduled_at: string | null
          session_number: number
          session_type: string
          source_ref: string | null
          status: string
          transcript: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          focus_topics?: string[]
          holder_id: string
          id?: string
          scheduled_at?: string | null
          session_number: number
          session_type?: string
          source_ref?: string | null
          status?: string
          transcript?: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          focus_topics?: string[]
          holder_id?: string
          id?: string
          scheduled_at?: string | null
          session_number?: number
          session_type?: string
          source_ref?: string | null
          status?: string
          transcript?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sessions_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_holders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_topic_templates: {
        Row: {
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          auth_user_id: string | null
          company_id: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_active: boolean
          member_role: string
          name: string
          role: string | null
          seniority_level: string | null
        }
        Insert: {
          auth_user_id?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          member_role?: string
          name: string
          role?: string | null
          seniority_level?: string | null
        }
        Update: {
          auth_user_id?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          member_role?: string
          name?: string
          role?: string | null
          seniority_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          parent_topic_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          parent_topic_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          parent_topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_join_request: { Args: { request_id: string }; Returns: undefined }
      current_company_id: { Args: never; Returns: string }
      generate_invite_code: { Args: never; Returns: string }
      match_document_chunks: {
        Args: {
          filter_company_id?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          similarity: number
        }[]
      }
      match_knowledge_chunks: {
        Args: {
          filter_company_id?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_type: string
          content: string
          holder_id: string
          id: string
          similarity: number
          source_quote: string
        }[]
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
