"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Profile } from "@/types/supabase";

export type LocalProfile = Profile & {
  household_id: string;
};

const STORAGE_KEY = "listacompra_current_profile";

/**
 * Hook para manejar la sesión local del usuario de forma persistente.
 * Ahora utiliza Supabase real para obtener los perfiles.
 */
export function useCurrentProfile() {
  const supabase = getSupabaseBrowserClient();
  
  const [currentProfile, setCurrentProfile] = useState<LocalProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.id && parsed.id.startsWith("user-")) {
            localStorage.removeItem(STORAGE_KEY);
          } else {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Error reading profile from storage", error);
      }
    }
    return null;
  });

  const { data: availableProfiles = [], isLoading: isProfilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      return data as LocalProfile[];
    }
  });

  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLocalLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  const changeProfile = (profile: LocalProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setCurrentProfile(profile);
    } catch (error) {
      console.error("Error saving profile to storage", error);
    }
  };

  const clearProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentProfile(null);
    } catch (error) {
      console.error("Error clearing profile", error);
    }
  };

  return {
    currentProfile,
    isLoading: isLocalLoading || isProfilesLoading,
    changeProfile,
    clearProfile,
    availableProfiles,
  };
}
