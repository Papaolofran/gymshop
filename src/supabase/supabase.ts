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
      categoria: {
        Row: {
          creado: string
          descripcion: Json
          id: string
          imagen: string
          nombre: string
        }
        Insert: {
          creado?: string
          descripcion: Json
          id?: string
          imagen: string
          nombre: string
        }
        Update: {
          creado?: string
          descripcion?: Json
          id?: string
          imagen?: string
          nombre?: string
        }
        Relationships: []
      }
      detalle_orden: {
        Row: {
          cantidad: number
          creado: string
          id: string
          id_orden: number
          id_variante: string
          precio: number
        }
        Insert: {
          cantidad: number
          creado?: string
          id?: string
          id_orden: number
          id_variante: string
          precio: number
        }
        Update: {
          cantidad?: number
          creado?: string
          id?: string
          id_orden?: number
          id_variante?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "detalle_orden_id_orden_fkey"
            columns: ["id_orden"]
            isOneToOne: false
            referencedRelation: "orden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_orden_id_variante_fkey"
            columns: ["id_variante"]
            isOneToOne: false
            referencedRelation: "variante"
            referencedColumns: ["id"]
          },
        ]
      }
      direccion: {
        Row: {
          actualizado: string
          ciudad: string
          codigo_postal: string
          creado: string
          id: string
          id_usuario: string | null
          linea1_direccion: string
          linea2_direccion: string | null
          pais: string
          provincia: string
        }
        Insert: {
          actualizado?: string
          ciudad: string
          codigo_postal: string
          creado?: string
          id?: string
          id_usuario?: string | null
          linea1_direccion: string
          linea2_direccion?: string | null
          pais?: string
          provincia: string
        }
        Update: {
          actualizado?: string
          ciudad?: string
          codigo_postal?: string
          creado?: string
          id?: string
          id_usuario?: string | null
          linea1_direccion?: string
          linea2_direccion?: string | null
          pais?: string
          provincia?: string
        }
        Relationships: [
          {
            foreignKeyName: "direccion_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      orden: {
        Row: {
          actualizado: string
          costo_envio: number
          creado: string
          estado: string
          fecha_entrega: string
          id: number
          id_direccion: string
          id_usuario: string
          metodo_pago: string
        }
        Insert: {
          actualizado?: string
          costo_envio: number
          creado?: string
          estado?: string
          fecha_entrega: string
          id?: number
          id_direccion: string
          id_usuario: string
          metodo_pago: string
        }
        Update: {
          actualizado?: string
          costo_envio?: number
          creado?: string
          estado?: string
          fecha_entrega?: string
          id?: number
          id_direccion?: string
          id_usuario?: string
          metodo_pago?: string
        }
        Relationships: [
          {
            foreignKeyName: "orden_id_direccion_fkey"
            columns: ["id_direccion"]
            isOneToOne: false
            referencedRelation: "direccion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orden_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      pago: {
        Row: {
          creado: string
          id: string
          id_orden: number
          metodo: string
          monto: number
        }
        Insert: {
          creado?: string
          id?: string
          id_orden: number
          metodo: string
          monto: number
        }
        Update: {
          creado?: string
          id?: string
          id_orden?: number
          metodo?: string
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "pago_id_orden_fkey"
            columns: ["id_orden"]
            isOneToOne: false
            referencedRelation: "orden"
            referencedColumns: ["id"]
          },
        ]
      }
      producto: {
        Row: {
          actualizado: string
          creado: string
          descripcion: Json
          destacado: boolean | null
          en_oferta: boolean | null
          id: string
          id_categoria: string | null
          imagenes: string[]
          marca: string
          nombre: string
          porcentaje_descuento: number | null
          slug: string | null
        }
        Insert: {
          actualizado?: string
          creado?: string
          descripcion: Json
          destacado?: boolean | null
          en_oferta?: boolean | null
          id?: string
          id_categoria?: string | null
          imagenes: string[]
          marca: string
          nombre: string
          porcentaje_descuento?: number | null
          slug?: string | null
        }
        Update: {
          actualizado?: string
          creado?: string
          descripcion?: Json
          destacado?: boolean | null
          en_oferta?: boolean | null
          id?: string
          id_categoria?: string | null
          imagenes?: string[]
          marca?: string
          nombre?: string
          porcentaje_descuento?: number | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producto_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id"]
          },
        ]
      }
      rol_usuario: {
        Row: {
          id: number
          id_usuario: string | null
          rol: string
        }
        Insert: {
          id?: number
          id_usuario?: string | null
          rol: string
        }
        Update: {
          id?: number
          id_usuario?: string | null
          rol?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          actualizado: string
          contrasena: string
          creado: string
          direccion: string
          email: string
          fecha_nacimiento: string
          id: string
          id_usuario: string
          nombre_completo: string
          telefono: string
        }
        Insert: {
          actualizado?: string
          contrasena: string
          creado?: string
          direccion: string
          email: string
          fecha_nacimiento: string
          id?: string
          id_usuario: string
          nombre_completo: string
          telefono: string
        }
        Update: {
          actualizado?: string
          contrasena?: string
          creado?: string
          direccion?: string
          email?: string
          fecha_nacimiento?: string
          id?: string
          id_usuario?: string
          nombre_completo?: string
          telefono?: string
        }
        Relationships: []
      }
      variante: {
        Row: {
          color: string | null
          id: string
          id_producto: string
          nombre_color: string | null
          precio: number
          sabor: string | null
          stock: number
          talla: string | null
          tamaño: string | null
        }
        Insert: {
          color?: string | null
          id?: string
          id_producto: string
          nombre_color?: string | null
          precio: number
          sabor?: string | null
          stock: number
          talla?: string | null
          tamaño?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          id_producto?: string
          nombre_color?: string | null
          precio?: number
          sabor?: string | null
          stock?: number
          talla?: string | null
          tamaño?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variantes_id_producto_fkey"
            columns: ["id_producto"]
            isOneToOne: false
            referencedRelation: "producto"
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
