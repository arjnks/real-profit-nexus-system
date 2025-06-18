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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_tiers: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string
          price: string
          tier_name: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          id?: string
          image_url: string
          price: string
          tier_name: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string
          price?: string
          tier_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          coin_value: number
          created_at: string
          description: string
          id: string
          source_order_id: string | null
          source_user_code: string | null
          transaction_type: string
          user_code: string
        }
        Insert: {
          amount: number
          coin_value?: number
          created_at?: string
          description: string
          id?: string
          source_order_id?: string | null
          source_user_code?: string | null
          transaction_type: string
          user_code: string
        }
        Update: {
          amount?: number
          coin_value?: number
          created_at?: string
          description?: string
          id?: string
          source_order_id?: string | null
          source_user_code?: string | null
          transaction_type?: string
          user_code?: string
        }
        Relationships: []
      }
      coin_wallets: {
        Row: {
          last_updated: string
          total_coins: number
          total_value: number
          user_code: string
        }
        Insert: {
          last_updated?: string
          total_coins?: number
          total_value?: number
          user_code: string
        }
        Update: {
          last_updated?: string
          total_coins?: number
          total_value?: number
          user_code?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          accumulated_point_money: number
          address: string | null
          code: string
          created_at: string
          current_level: number | null
          direct_referrals: Json
          id: string
          is_pending: boolean
          is_reserved: boolean
          joined_date: string
          last_mlm_distribution: string | null
          matrix_earnings: number | null
          mini_coins: number
          mlm_level: number
          monthly_commissions: Json
          monthly_spent: Json
          name: string
          parent_code: string | null
          password_hash: string | null
          phone: string
          points: number
          tier: string
          total_coins: number | null
          total_commissions: number
          total_downline_count: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          accumulated_point_money?: number
          address?: string | null
          code: string
          created_at?: string
          current_level?: number | null
          direct_referrals?: Json
          id?: string
          is_pending?: boolean
          is_reserved?: boolean
          joined_date?: string
          last_mlm_distribution?: string | null
          matrix_earnings?: number | null
          mini_coins?: number
          mlm_level?: number
          monthly_commissions?: Json
          monthly_spent?: Json
          name: string
          parent_code?: string | null
          password_hash?: string | null
          phone: string
          points?: number
          tier?: string
          total_coins?: number | null
          total_commissions?: number
          total_downline_count?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          accumulated_point_money?: number
          address?: string | null
          code?: string
          created_at?: string
          current_level?: number | null
          direct_referrals?: Json
          id?: string
          is_pending?: boolean
          is_reserved?: boolean
          joined_date?: string
          last_mlm_distribution?: string | null
          matrix_earnings?: number | null
          mini_coins?: number
          mlm_level?: number
          monthly_commissions?: Json
          monthly_spent?: Json
          name?: string
          parent_code?: string | null
          password_hash?: string | null
          phone?: string
          points?: number
          tier?: string
          total_coins?: number | null
          total_commissions?: number
          total_downline_count?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_sales: {
        Row: {
          created_at: string | null
          id: string
          sale_date: string
          total_orders: number
          total_points: number
          total_sales: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sale_date: string
          total_orders?: number
          total_points?: number
          total_sales?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sale_date?: string
          total_orders?: number
          total_points?: number
          total_sales?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      leaderboard_config: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          offer_description: string
          offer_discount_percentage: number
          offer_title: string
          top_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          offer_description?: string
          offer_discount_percentage?: number
          offer_title?: string
          top_count?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          offer_description?: string
          offer_discount_percentage?: number
          offer_title?: string
          top_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      mlm_distributions: {
        Row: {
          amount: number
          created_at: string
          from_customer_code: string
          from_level: number
          id: string
          to_customer_code: string
          to_level: number
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_customer_code: string
          from_level: number
          id?: string
          to_customer_code: string
          to_level: number
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_customer_code?: string
          from_level?: number
          id?: string
          to_customer_code?: string
          to_level?: number
          transaction_type?: string
        }
        Relationships: []
      }
      mlm_level_config: {
        Row: {
          capacity: number
          coin_value: number
          level: number
        }
        Insert: {
          capacity: number
          coin_value?: number
          level: number
        }
        Update: {
          capacity?: number
          coin_value?: number
          level?: number
        }
        Relationships: []
      }
      mlm_slots: {
        Row: {
          coin_value: number
          created_at: string
          customer_code: string
          id: string
          level: number
          position: number
          updated_at: string
        }
        Insert: {
          coin_value?: number
          created_at?: string
          customer_code: string
          id?: string
          level: number
          position: number
          updated_at?: string
        }
        Update: {
          coin_value?: number
          created_at?: string
          customer_code?: string
          id?: string
          level?: number
          position?: number
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
            referencedRelation: "customer_leaderboard"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "customer_leaderboard"
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
          dummy_price: number | null
          id: string
          image: string
          in_stock: boolean
          mrp: number
          name: string
          price: number
          stock_quantity: number
          tier_discounts: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          dummy_price?: number | null
          id?: string
          image: string
          in_stock?: boolean
          mrp: number
          name: string
          price: number
          stock_quantity?: number
          tier_discounts?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          dummy_price?: number | null
          id?: string
          image?: string
          in_stock?: boolean
          mrp?: number
          name?: string
          price?: number
          stock_quantity?: number
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
      customer_leaderboard: {
        Row: {
          code: string | null
          id: string | null
          name: string | null
          points: number | null
          rank: number | null
          tier: string | null
          total_spent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      distribute_commissions_from_level: {
        Args: {
          source_level: number
          source_customer_code: string
          coins_count: number
        }
        Returns: undefined
      }
      get_next_slot_position: {
        Args: { target_level: number }
        Returns: number
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
