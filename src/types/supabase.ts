/**
 * Estructura para los tipos de Supabase.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  household_id: string;
  display_name: string;
  color: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Household = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type HouseholdMember = {
  id: string;
  household_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'invited';
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      households: {
        Row: Household;
        Insert: Omit<Household, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Household, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      household_members: {
        Row: HouseholdMember;
        Insert: Omit<HouseholdMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HouseholdMember, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "household_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      // ... otras tablas se generarán aquí en el futuro
      shopping_items: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          quantity: number;
          unit: string | null;
          notes: string | null;
          status: 'pending' | 'completed';
          category: string | null;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          purchased_at: string | null;
          deleted_at: string | null;
          client_id: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          quantity?: number;
          unit?: string | null;
          notes?: string | null;
          status?: 'pending' | 'completed';
          category?: string | null;
          created_by: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          purchased_at?: string | null;
          deleted_at?: string | null;
          client_id?: string | null;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          quantity?: number;
          unit?: string | null;
          notes?: string | null;
          status?: 'pending' | 'completed';
          category?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          purchased_at?: string | null;
          deleted_at?: string | null;
          client_id?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          household_id: string;
          actor_id: string;
          action_type: 'added' | 'completed' | 'deleted';
          item_count: number;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          actor_id: string;
          action_type: 'added' | 'completed' | 'deleted';
          item_count: number;
          summary: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          actor_id?: string;
          action_type?: 'added' | 'completed' | 'deleted';
          item_count?: number;
          summary?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      frequent_products: {
        Row: {
          household_id: string;
          name: string;
          category: string;
          frequency: number;
          last_purchased_at: string | null;
        };
        Insert: {
          household_id: string;
          name: string;
          category: string;
          frequency?: number;
          last_purchased_at?: string | null;
        };
        Update: {
          household_id?: string;
          name?: string;
          category?: string;
          frequency?: number;
          last_purchased_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      update_shopping_item_safe: {
        Args: {
          p_id: string;
          p_quantity?: number | null;
          p_status?: string | null;
          p_last_known_updated_at?: string | null;
        };
        Returns: {
          conflict: boolean;
          success: boolean;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
