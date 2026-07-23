export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ChunkType =
  | 'decision'
  | 'heuristic'
  | 'failure_pattern'
  | 'process'
  | 'contact'
  | 'warning'
  | 'tribal_rule'
  | 'workaround'

export type CaptureSource =
  | 'interview'
  | 'slack'
  | 'email'
  | 'meeting'
  | 'document_edit'
  | 'qa_response'
  | 'manual'

export type HolderStatus = 'active' | 'paused' | 'complete' | 'departed'
export type CaptureMode = 'interview_only' | 'passive_only' | 'hybrid'
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
export type SessionType = 'structured_interview' | 'passive_capture' | 'qa_resolution'
export type SessionStatus = 'scheduled' | 'active' | 'processing' | 'processed' | 'failed'
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low'
export type GapStatus = 'open' | 'scheduled' | 'in_progress' | 'resolved'
export type QuestionStatus =
  | 'pending'
  | 'answered_by_agent'
  | 'routed_to_human'
  | 'answered_by_human'
  | 'escalated'
export type DocumentStatus = 'pending' | 'processing' | 'processed' | 'failed'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          config?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          config?: Json
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          company_id: string
          auth_user_id: string | null
          name: string
          email: string | null
          role: string | null
          department: string | null
          seniority_level: SeniorityLevel | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          auth_user_id?: string | null
          name: string
          email?: string | null
          role?: string | null
          department?: string | null
          seniority_level?: SeniorityLevel | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          auth_user_id?: string | null
          name?: string
          email?: string | null
          role?: string | null
          department?: string | null
          seniority_level?: SeniorityLevel | null
          is_active?: boolean
          created_at?: string
        }
      }
      knowledge_holders: {
        Row: {
          id: string
          company_id: string
          team_member_id: string | null
          name: string
          role: string | null
          department: string | null
          tenure_years: number | null
          domains: string[]
          retiring_at: string | null
          status: HolderStatus
          capture_mode: CaptureMode
          knowledge_completeness: number
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          team_member_id?: string | null
          name: string
          role?: string | null
          department?: string | null
          tenure_years?: number | null
          domains?: string[]
          retiring_at?: string | null
          status?: HolderStatus
          capture_mode?: CaptureMode
          knowledge_completeness?: number
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          team_member_id?: string | null
          name?: string
          role?: string | null
          department?: string | null
          tenure_years?: number | null
          domains?: string[]
          retiring_at?: string | null
          status?: HolderStatus
          capture_mode?: CaptureMode
          knowledge_completeness?: number
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          parent_topic_id: string | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          parent_topic_id?: string | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          parent_topic_id?: string | null
          is_system?: boolean
          created_at?: string
        }
      }
      knowledge_chunks: {
        Row: {
          id: string
          holder_id: string
          session_id: string | null
          topic_id: string | null
          chunk_type: ChunkType
          capture_source: CaptureSource
          content: string
          source_quote: string | null
          embedding: number[] | null
          confidence: number
          reviewed: boolean
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          holder_id: string
          session_id?: string | null
          topic_id?: string | null
          chunk_type: ChunkType
          capture_source: CaptureSource
          content: string
          source_quote?: string | null
          embedding?: number[] | null
          confidence?: number
          reviewed?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          holder_id?: string
          session_id?: string | null
          topic_id?: string | null
          chunk_type?: ChunkType
          capture_source?: CaptureSource
          content?: string
          source_quote?: string | null
          embedding?: number[] | null
          confidence?: number
          reviewed?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          holder_id: string
          session_number: number
          session_type: SessionType
          focus_topics: string[]
          transcript: Json
          source_ref: string | null
          status: SessionStatus
          scheduled_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          holder_id: string
          session_number: number
          session_type?: SessionType
          focus_topics?: string[]
          transcript?: Json
          source_ref?: string | null
          status?: SessionStatus
          scheduled_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          holder_id?: string
          session_number?: number
          session_type?: SessionType
          focus_topics?: string[]
          transcript?: Json
          source_ref?: string | null
          status?: SessionStatus
          scheduled_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      gap_flags: {
        Row: {
          id: string
          holder_id: string
          topic_id: string | null
          description: string
          severity: GapSeverity
          status: GapStatus
          detected_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          holder_id: string
          topic_id?: string | null
          description: string
          severity?: GapSeverity
          status?: GapStatus
          detected_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          holder_id?: string
          topic_id?: string | null
          description?: string
          severity?: GapSeverity
          status?: GapStatus
          detected_at?: string
          resolved_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          company_id: string
          asked_by: string
          content: string
          status: QuestionStatus
          answered_by_chunk_id: string | null
          agent_answer: string | null
          agent_confidence: number | null
          routed_to: string | null
          human_answer: string | null
          spawned_chunk_id: string | null
          topic_id: string | null
          created_at: string
          answered_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          asked_by: string
          content: string
          status?: QuestionStatus
          answered_by_chunk_id?: string | null
          agent_answer?: string | null
          agent_confidence?: number | null
          routed_to?: string | null
          human_answer?: string | null
          spawned_chunk_id?: string | null
          topic_id?: string | null
          created_at?: string
          answered_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          asked_by?: string
          content?: string
          status?: QuestionStatus
          answered_by_chunk_id?: string | null
          agent_answer?: string | null
          agent_confidence?: number | null
          routed_to?: string | null
          human_answer?: string | null
          spawned_chunk_id?: string | null
          topic_id?: string | null
          created_at?: string
          answered_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          company_id: string
          name: string
          doc_type: string | null
          storage_path: string | null
          status: DocumentStatus
          uploaded_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          doc_type?: string | null
          storage_path?: string | null
          status?: DocumentStatus
          uploaded_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          doc_type?: string | null
          storage_path?: string | null
          status?: DocumentStatus
          uploaded_at?: string
        }
      }
      system_topic_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sort_order?: number
        }
      }
    }
  }
}