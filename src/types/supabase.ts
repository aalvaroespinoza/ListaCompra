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

export interface Profile {
  id: string;
  household_id: string;
  display_name: string;
  color: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'invited';
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      households: {
        Row: Household;
        Insert: Omit<Household, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Household, 'id' | 'created_at' | 'updated_at'>>;
      };
      household_members: {
        Row: HouseholdMember;
        Insert: Omit<HouseholdMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HouseholdMember, 'id' | 'created_at' | 'updated_at'>>;
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
        };
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
        }
      }
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
