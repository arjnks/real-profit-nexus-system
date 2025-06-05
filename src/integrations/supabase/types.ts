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
      admin_users: {
        Row: {
          created_at: string
          id: string
          name: string
          password_hash: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password_hash: string
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          accumulated_point_money: number
          code: string
          created_at: string
          id: string
          is_pending: boolean
          is_reserved: boolean
          joined_date: string
          last_mlm_distribution: string | null
          mini_coins: number
          monthly_spent: Json
          name: string
          parent_code: string | null
          password_hash: string | null
          phone: string
          points: number
          tier: string
          total_spent: number
          updated_at: string
        }
        Insert: {
          accumulated_point_money?: number
          code: string
          created_at?: string
          id?: string
          is_pending?: boolean
          is_reserved?: boolean
          joined_date?: string
          last_mlm_distribution?: string | null
          mini_coins?: number
          monthly_spent?: Json
          name: string
          parent_code?: string | null
          password_hash?: string | null
          phone: string
          points?: number
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Update: {
          accumulated_point_money?: number
          code?: string
          created_at?: string
          id?: string
          is_pending?: boolean
          is_reserved?: boolean
          joined_date?: string
          last_mlm_distribution?: string | null
          mini_coins?: number
          monthly_spent?: Json
          name?: string
          parent_code?: string | null
          password_hash?: string | null
          phone?: string
          points?: number
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          description: string
          discount_percentage: number
          id: string
          image: string
          min_tier: string
          title: string
          updated_at: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_percentage: number
          id?: string
          image: string
          min_tier: string
          title: string
          updated_at?: string
          valid_until: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percentage?: number
          id?: string
          image?: string
          min_tier?: string
          title?: string
          updated_at?: string
          valid_until?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid: number
          created_at: string
          customer_code: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          delivery_approved: boolean
          id: string
          is_pending_approval: boolean
          is_points_awarded: boolean
          mlm_distribution_log: Json
          order_date: string
          payment_method: string
          pincode: string
          points: number
          points_approved: boolean
          points_used: number
          products: Json
          status: string
          total_amount: number
          updated_at: string
          used_points_discount: boolean | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          customer_code?: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          delivery_approved?: boolean
          id: string
          is_pending_approval?: boolean
          is_points_awarded?: boolean
          mlm_distribution_log?: Json
          order_date?: string
          payment_method: string
          pincode: string
          points?: number
          points_approved?: boolean
          points_used?: number
          products: Json
          status?: string
          total_amount: number
          updated_at?: string
          used_points_discount?: boolean | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_code?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          delivery_approved?: boolean
          id?: string
          is_pending_approval?: boolean
          is_points_awarded?: boolean
          mlm_distribution_log?: Json
          order_date?: string
          payment_method?: string
          pincode?: string
          points?: number
          points_approved?: boolean
          points_used?: number
          products?: Json
          status?: string
          total_amount?: number
          updated_at?: string
          used_points_discount?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image: string
          in_stock: boolean
          mrp: number
          name: string
          price: number
          tier_discounts: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image: string
          in_stock?: boolean
          mrp: number
          name: string
          price: number
          tier_discounts?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          in_stock?: boolean
          mrp?: number
          name?: string
          price?: number
          tier_discounts?: Json
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image: string
          is_active: boolean
          price: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image: string
          is_active?: boolean
          price: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          is_active?: boolean
          price?: string
          title?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
