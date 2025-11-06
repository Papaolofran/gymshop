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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          id: string
          postal_code: string
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          postal_code: string
          state: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direccion_id_usuario_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: Json
          id: string
          image: string
          name: string
        }
        Insert: {
          created_at?: string
          description: Json
          id?: string
          image: string
          name: string
        }
        Update: {
          created_at?: string
          description?: Json
          id?: string
          image?: string
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: number
          price?: number
          quantity?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detalle_orden_id_orden_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_orden_id_variante_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string
          direction_id: string
          id: number
          shipping_cost: number
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_date: string
          direction_id: string
          id?: number
          shipping_cost: number
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string
          direction_id?: string
          id?: number
          shipping_cost?: number
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orden_id_direccion_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orden_id_usuario_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          order_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pago_id_orden_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category_id: string
          created_at: string
          description: Json
          discount_percentage: number | null
          features: string[]
          highlighted: boolean | null
          id: string
          images: string[]
          name: string
          on_discount: boolean | null
          slug: string
          updated_at: string
        }
        Insert: {
          brand: string
          category_id: string
          created_at?: string
          description: Json
          discount_percentage?: number | null
          features: string[]
          highlighted?: boolean | null
          id?: string
          images: string[]
          name: string
          on_discount?: boolean | null
          slug: string
          updated_at?: string
        }
        Update: {
          brand?: string
          category_id?: string
          created_at?: string
          description?: Json
          discount_percentage?: number | null
          features?: string[]
          highlighted?: boolean | null
          id?: string
          images?: string[]
          name?: string
          on_discount?: boolean | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_id_categoria_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          birth_date: string
          created_at: string
          email: string
          full_name: string
          id: string
          password: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          password: string
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          password?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      variants: {
        Row: {
          color: string | null
          color_name: string | null
          flavor: string | null
          id: string
          price: number
          product_id: string
          size: string | null
          stock: number
          weight: string | null
        }
        Insert: {
          color?: string | null
          color_name?: string | null
          flavor?: string | null
          id?: string
          price: number
          product_id: string
          size?: string | null
          stock: number
          weight?: string | null
        }
        Update: {
          color?: string | null
          color_name?: string | null
          flavor?: string | null
          id?: string
          price?: number
          product_id?: string
          size?: string | null
          stock?: number
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variantes_id_producto_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
