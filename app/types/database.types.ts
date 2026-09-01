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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      client_service_payments: {
        Row: {
          amount: number
          client_service_id: string
          created_at: string
          id: string
          method: string | null
          notes: string | null
          paid_at: string
          recorded_by: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_service_id: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string
          recorded_by?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_service_id?: string
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string
          recorded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_service_payments_client_service_id_fkey"
            columns: ["client_service_id"]
            isOneToOne: false
            referencedRelation: "client_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      client_service_stages: {
        Row: {
          client_service_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          notes: string | null
          position: number
          stage: Database["public"]["Enums"]["service_stage"]
          updated_at: string
        }
        Insert: {
          client_service_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position: number
          stage: Database["public"]["Enums"]["service_stage"]
          updated_at?: string
        }
        Update: {
          client_service_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          stage?: Database["public"]["Enums"]["service_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_service_stages_client_service_id_fkey"
            columns: ["client_service_id"]
            isOneToOne: false
            referencedRelation: "client_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_stages_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_service_stages_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      client_services: {
        Row: {
          amount: number
          client_id: string
          commission_enabled: boolean
          created_at: string
          currency: string
          ends_at: string | null
          id: string
          manager_id: string | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          service_id: string
          starts_at: string
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id: string
          commission_enabled?: boolean
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          commission_enabled?: boolean
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "client_services_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "client_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          commission_rate: number
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          price: number
          slug: string
          title: string
          tutor_id: string | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price?: number
          slug: string
          title: string
          tutor_id?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price?: number
          slug?: string
          title?: string
          tutor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      enrollments: {
        Row: {
          amount: number
          completed_at: string | null
          course_id: string
          created_at: string
          currency: string
          enrolled_at: string
          id: string
          progress: number
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          completed_at?: string | null
          course_id: string
          created_at?: string
          currency?: string
          enrolled_at?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          course_id?: string
          created_at?: string
          currency?: string
          enrolled_at?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      payout_accounts: {
        Row: {
          account_number: string | null
          created_at: string
          holder_name: string | null
          id: string
          is_default: boolean
          label: string | null
          method: Database["public"]["Enums"]["payout_method"]
          profile_id: string
          provider: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          holder_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          method: Database["public"]["Enums"]["payout_method"]
          profile_id: string
          provider?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          created_at?: string
          holder_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          method?: Database["public"]["Enums"]["payout_method"]
          profile_id?: string
          provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          referral_code: string
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      referral_earnings: {
        Row: {
          amount: number
          base_amount: number
          created_at: string
          currency: string
          id: string
          rate: number
          referred_id: string
          referrer_id: string
          source_id: string | null
          source_type: string
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          base_amount?: number
          created_at?: string
          currency?: string
          id?: string
          rate?: number
          referred_id: string
          referrer_id: string
          source_id?: string | null
          source_type: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          base_amount?: number
          created_at?: string
          currency?: string
          id?: string
          rate?: number
          referred_id?: string
          referrer_id?: string
          source_id?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_earnings_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "referral_earnings_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_earnings_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referral_summary"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      services: {
        Row: {
          carousel_count: number
          commission_rate: number
          created_at: string
          currency: string
          description: string | null
          id: string
          image_count: number
          is_active: boolean
          manages_social: boolean
          name: string
          price: number
          shooting_hours: number
          slug: string
          social_networks: Database["public"]["Enums"]["social_network"][]
          updated_at: string
          video_count: number
        }
        Insert: {
          carousel_count?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_count?: number
          is_active?: boolean
          manages_social?: boolean
          name: string
          price?: number
          shooting_hours?: number
          slug: string
          social_networks?: Database["public"]["Enums"]["social_network"][]
          updated_at?: string
          video_count?: number
        }
        Update: {
          carousel_count?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_count?: number
          is_active?: boolean
          manages_social?: boolean
          name?: string
          price?: number
          shooting_hours?: number
          slug?: string
          social_networks?: Database["public"]["Enums"]["social_network"][]
          updated_at?: string
          video_count?: number
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          eta_hours: number
          id: string
          notes: string | null
          payout_account_id: string | null
          payout_account_number: string | null
          payout_holder: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          payout_provider: string | null
          referrer_id: string
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          eta_hours?: number
          id?: string
          notes?: string | null
          payout_account_id?: string | null
          payout_account_number?: string | null
          payout_holder?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          payout_provider?: string | null
          referrer_id: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          eta_hours?: number
          id?: string
          notes?: string | null
          payout_account_id?: string | null
          payout_account_number?: string | null
          payout_holder?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          payout_provider?: string | null
          referrer_id?: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      referral_balance: {
        Row: {
          available_amount: number | null
          locked_amount: number | null
          profile_id: string | null
          requested_amount: number | null
          withdrawn_amount: number | null
        }
        Relationships: []
      }
      referral_summary: {
        Row: {
          email: string | null
          full_name: string | null
          paid_earned: number | null
          pending_earned: number | null
          profile_id: string | null
          referral_code: string | null
          referred_count: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_earned: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_referred_services: {
        Args: never
        Returns: {
          earning_id: string
          service_name: string
          service_status: Database["public"]["Enums"]["service_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          starts_at: string
          ends_at: string | null
          commission_amount: number
          commission_status: Database["public"]["Enums"]["referral_status"]
          currency: string
          total_stages: number
          completed_stages: number
        }[]
      }
      request_commission_withdrawal: {
        Args: { p_amount: number; p_account_id: string; p_notes?: string }
        Returns: string
      }
      sync_client_service_stages: {
        Args: { p_client_service_id: string }
        Returns: undefined
      }
    }
    Enums: {
      enrollment_status: "activo" | "completado" | "cancelado"
      payment_status: "espera" | "inicial" | "debe" | "pagado"
      payout_method: "efectivo" | "transferencia" | "bre_b"
      referral_status: "pendiente" | "aprobado" | "pagado" | "anulado"
      service_stage:
        | "pre_produccion"
        | "produccion"
        | "pos_produccion"
        | "correccion"
        | "entrega"
        | "publicacion"
        | "informe"
      service_status: "activo" | "finalizado" | "cancelado"
      social_network:
        | "facebook"
        | "instagram"
        | "tiktok"
        | "linkedin"
        | "x"
        | "youtube"
      user_role: "superusuario" | "tutor" | "cliente" | "alumno" | "afiliado"
      withdrawal_status: "en_proceso" | "procesado" | "cancelado"
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
    Enums: {
      enrollment_status: ["activo", "completado", "cancelado"],
      payment_status: ["espera", "inicial", "debe", "pagado"],
      payout_method: ["efectivo", "transferencia", "bre_b"],
      referral_status: ["pendiente", "aprobado", "pagado", "anulado"],
      service_stage: [
        "pre_produccion",
        "produccion",
        "pos_produccion",
        "correccion",
        "entrega",
        "publicacion",
        "informe",
      ],
      service_status: ["activo", "finalizado", "cancelado"],
      social_network: [
        "facebook",
        "instagram",
        "tiktok",
        "linkedin",
        "x",
        "youtube",
      ],
      user_role: ["superusuario", "tutor", "cliente", "alumno", "afiliado"],
      withdrawal_status: ["en_proceso", "procesado", "cancelado"],
    },
  },
} as const
