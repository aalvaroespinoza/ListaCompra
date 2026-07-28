import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Household, HouseholdMember, Profile } from '@/types/supabase';

// Tipo compuesto para facilitar la UI
export type MemberWithProfile = HouseholdMember & {
  profile: Profile;
};

export class HouseholdRepository {
  /**
   * Obtiene los miembros activos de un hogar, incluyendo sus perfiles
   */
  static async getMembers(householdId: string): Promise<MemberWithProfile[]> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('household_members')
      .select('*, profile:profiles(*)')
      .eq('household_id', householdId)
      .eq('status', 'active');

    if (error) {
      console.error("Error fetching household members:", error);
      throw error;
    }
    
    // Supabase returns related tables as arrays or single objects based on the relationship.
    // In our case it's a 1-to-1 from the member's perspective.
    return (data || []).map((item: HouseholdMember & { profile: Profile | Profile[] | null }) => ({
      ...item,
      profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
    })) as MemberWithProfile[];
  }

  /**
   * Obtiene los hogares a los que pertenece el usuario actual
   */
  static async getUserHouseholds(): Promise<Household[]> {
    const supabase = getSupabaseBrowserClient();
    
    // Obtenemos los memberships del usuario actual (el token determina auth.uid() y RLS filtra el resto)
    const { data: members, error: membersError } = await supabase
      .from('household_members')
      .select('household:households(*)')
      .eq('status', 'active');

    if (membersError) {
      console.error("Error fetching user households:", membersError);
      throw membersError;
    }

    // Extraemos los households
    const households = (members || [])
        .map((m: { household: Household | Household[] | null }) => Array.isArray(m.household) ? m.household[0] : m.household)
        .filter(Boolean);

    return households as Household[];
  }
}
