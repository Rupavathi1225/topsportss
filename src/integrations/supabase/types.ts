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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      click_tracking: {
        Row: {
          city: string | null
          clicked_item_id: string
          clicked_item_type: string
          country_code: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          screen_resolution: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          clicked_item_id: string
          clicked_item_type: string
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          clicked_item_id?: string
          clicked_item_type?: string
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      landing_page: {
        Row: {
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      link_redirects: {
        Row: {
          created_at: string
          id: number
          original_url: string
        }
        Insert: {
          created_at?: string
          id?: number
          original_url: string
        }
        Update: {
          created_at?: string
          id?: number
          original_url?: string
        }
        Relationships: []
      }
      related_categories: {
        Row: {
          created_at: string
          id: string
          serial_number: number
          title: string
          updated_at: string
          web_result_page: number
        }
        Insert: {
          created_at?: string
          id?: string
          serial_number: number
          title: string
          updated_at?: string
          web_result_page?: number
        }
        Update: {
          created_at?: string
          id?: string
          serial_number?: number
          title?: string
          updated_at?: string
          web_result_page?: number
        }
        Relationships: []
      }
      web_result_countries: {
        Row: {
          allowed_countries: string[] | null
          backlink_url: string | null
          created_at: string
          id: string
          is_worldwide: boolean
          updated_at: string
          web_result_id: string
        }
        Insert: {
          allowed_countries?: string[] | null
          backlink_url?: string | null
          created_at?: string
          id?: string
          is_worldwide?: boolean
          updated_at?: string
          web_result_id: string
        }
        Update: {
          allowed_countries?: string[] | null
          backlink_url?: string | null
          created_at?: string
          id?: string
          is_worldwide?: boolean
          updated_at?: string
          web_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_result_countries_web_result_id_fkey"
            columns: ["web_result_id"]
            isOneToOne: false
            referencedRelation: "web_results"
            referencedColumns: ["id"]
          },
        ]
      }
      web_results: {
        Row: {
          created_at: string
          description: string
          id: string
          imported_from: string | null
          is_sponsored: boolean
          logo_url: string | null
          offer_name: string
          original_link: string
          serial_number: number
          title: string
          updated_at: string
          web_result_page: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          imported_from?: string | null
          is_sponsored?: boolean
          logo_url?: string | null
          offer_name: string
          original_link: string
          serial_number: number
          title: string
          updated_at?: string
          web_result_page: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          imported_from?: string | null
          is_sponsored?: boolean
          logo_url?: string | null
          offer_name?: string
          original_link?: string
          serial_number?: number
          title?: string
          updated_at?: string
          web_result_page?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
