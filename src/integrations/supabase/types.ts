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
      completion: {
        Row: {
          completed_at: string
          daily_task_id: string
          id: string
          kid_id: string
        }
        Insert: {
          completed_at?: string
          daily_task_id: string
          id?: string
          kid_id: string
        }
        Update: {
          completed_at?: string
          daily_task_id?: string
          id?: string
          kid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_daily_task_id_fkey"
            columns: ["daily_task_id"]
            isOneToOne: false
            referencedRelation: "daily_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kid"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_task: {
        Row: {
          created_at: string | null
          due_date: string
          id: string
          kid_id: string
          points_awarded: number | null
          status: string
          task_template_id: string
        }
        Insert: {
          created_at?: string | null
          due_date: string
          id?: string
          kid_id: string
          points_awarded?: number | null
          status?: string
          task_template_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string
          id?: string
          kid_id?: string
          points_awarded?: number | null
          status?: string
          task_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_task_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kid"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_task_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_template"
            referencedColumns: ["id"]
          },
        ]
      }
      family: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_uid: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_uid: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_uid?: string
        }
        Relationships: []
      }
      kid: {
        Row: {
          age: number | null
          avatar_url: string | null
          color_hex: string | null
          created_at: string | null
          display_name: string
          family_id: string
          id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          color_hex?: string | null
          created_at?: string | null
          display_name: string
          family_id: string
          id?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          color_hex?: string | null
          created_at?: string | null
          display_name?: string
          family_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kid_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string | null
          description: string
          entry_type: Database["public"]["Enums"]["ledger_type"]
          id: string
          kid_id: string
          points: number
          ref_id: string | null
          ref_table: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          entry_type: Database["public"]["Enums"]["ledger_type"]
          id?: string
          kid_id: string
          points: number
          ref_id?: string | null
          ref_table?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          entry_type?: Database["public"]["Enums"]["ledger_type"]
          id?: string
          kid_id?: string
          points?: number
          ref_id?: string | null
          ref_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kid"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption: {
        Row: {
          decided_at: string | null
          decided_by: string | null
          id: string
          kid_id: string
          notes: string | null
          requested_at: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
        }
        Insert: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          kid_id: string
          notes?: string | null
          requested_at?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
        }
        Update: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          kid_id?: string
          notes?: string | null
          requested_at?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
        }
        Relationships: [
          {
            foreignKeyName: "redemption_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kid"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
        ]
      }
      reward: {
        Row: {
          active: boolean
          cost_points: number
          created_at: string | null
          description: string | null
          family_id: string
          icon_emoji: string | null
          id: string
          title: string
        }
        Insert: {
          active?: boolean
          cost_points: number
          created_at?: string | null
          description?: string | null
          family_id: string
          icon_emoji?: string | null
          id?: string
          title: string
        }
        Update: {
          active?: boolean
          cost_points?: number
          created_at?: string | null
          description?: string | null
          family_id?: string
          icon_emoji?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      task_template: {
        Row: {
          active: boolean
          base_points: number
          created_at: string | null
          description: string | null
          family_id: string
          icon_emoji: string | null
          id: string
          recurrence: Database["public"]["Enums"]["recurrence"]
          title: string
        }
        Insert: {
          active?: boolean
          base_points: number
          created_at?: string | null
          description?: string | null
          family_id: string
          icon_emoji?: string | null
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence"]
          title: string
        }
        Update: {
          active?: boolean
          base_points?: number
          created_at?: string | null
          description?: string | null
          family_id?: string
          icon_emoji?: string | null
          id?: string
          recurrence?: Database["public"]["Enums"]["recurrence"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_template_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_bonus_eligibility: {
        Args: { p_kid_id: string; p_period: string }
        Returns: Json
      }
      complete_task: {
        Args: { p_daily_task_id: string }
        Returns: number
      }
      generate_today_tasks: {
        Args: { p_family_id: string; p_target_date?: string }
        Returns: number
      }
      get_kid_balance: {
        Args: { p_kid_id: string }
        Returns: number
      }
      get_kid_points: {
        Args: { p_kid_id: string }
        Returns: number
      }
      grant_bonus: {
        Args: { p_kid_id: string; p_period: string }
        Returns: number
      }
    }
    Enums: {
      ledger_type: "credit" | "debit" | "bonus"
      recurrence: "daily" | "weekly" | "once"
      redemption_status: "pending" | "approved" | "rejected" | "delivered"
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
      ledger_type: ["credit", "debit", "bonus"],
      recurrence: ["daily", "weekly", "once"],
      redemption_status: ["pending", "approved", "rejected", "delivered"],
    },
  },
} as const
