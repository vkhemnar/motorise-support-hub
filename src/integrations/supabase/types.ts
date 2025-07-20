export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          bot_response: string | null
          created_at: string
          file_url: string | null
          id: string
          is_unsatisfied: boolean
          question: string
          resolved: boolean
          user_phone: string
        }
        Insert: {
          bot_response?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_unsatisfied?: boolean
          question: string
          resolved?: boolean
          user_phone: string
        }
        Update: {
          bot_response?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_unsatisfied?: boolean
          question?: string
          resolved?: boolean
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_phone_fkey"
            columns: ["user_phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone_number"]
          },
        ]
      }
      faqs: {
        Row: {
          id: string
          question: string
          response: string
        }
        Insert: {
          id?: string
          question: string
          response: string
        }
        Update: {
          id?: string
          question?: string
          response?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          phone_number: string
          product: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          phone_number: string
          product: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          phone_number?: string
          product?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_phone_number_fkey"
            columns: ["phone_number"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone_number"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          admin_phone: string
          created_at: string
          id: string
          response_file_url: string | null
          response_text: string | null
          ticket_id: string
        }
        Insert: {
          admin_phone: string
          created_at?: string
          id?: string
          response_file_url?: string | null
          response_text?: string | null
          ticket_id: string
        }
        Update: {
          admin_phone?: string
          created_at?: string
          id?: string
          response_file_url?: string | null
          response_text?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
          user_phone: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
          user_phone: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      unsatisfied_queries: {
        Row: {
          chat_id: string
          file_url: string | null
          id: string
          timestamp: string
          user_phone: string
        }
        Insert: {
          chat_id: string
          file_url?: string | null
          id?: string
          timestamp?: string
          user_phone: string
        }
        Update: {
          chat_id?: string
          file_url?: string | null
          id?: string
          timestamp?: string
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "unsatisfied_queries_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unsatisfied_queries_user_phone_fkey"
            columns: ["user_phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone_number"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          phone_number: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          phone_number: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["user_role"]
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
      ticket_status: "open" | "in_progress" | "resolved"
      user_role: "admin" | "customer"
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
      ticket_status: ["open", "in_progress", "resolved"],
      user_role: ["admin", "customer"],
    },
  },
} as const
