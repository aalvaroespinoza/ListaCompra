"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/types/supabase";

// Expandimos Profile para incluir el household_id que será útil en el frontend
export type LocalProfile = Profile & {
  household_id: string;
};

// Mapeo estático simulando la tabla profiles para el hogar principal
export const FAMILY_PROFILES: LocalProfile[] = [
  { 
    id: "bd9c085b-e4a8-4e8a-a63e-6bd8cbe4f8e5", display_name: "Alvaro", color: "#007AFF", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "e52fbd1e-58c5-43be-8e05-64c8c7ad4e42" 
  },
  { 
    id: "f0a3594b-2f04-4b55-ab1b-c3d31fc1be8b", display_name: "Mamá", color: "#FF2D55", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "e52fbd1e-58c5-43be-8e05-64c8c7ad4e42" 
  },
  { 
    id: "593b4a2c-9821-4d37-83d2-d61efcf703b4", display_name: "Papá", color: "#5856D6", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "e52fbd1e-58c5-43be-8e05-64c8c7ad4e42" 
  },
  { 
    id: "a86241a8-c2b6-455b-9b48-1518f8eb0cc0", display_name: "Hermano", color: "#FF9500", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "e52fbd1e-58c5-43be-8e05-64c8c7ad4e42" 
  },
  { 
    id: "d79f046b-8cf7-4f16-92b0-8c2014df8b52", display_name: "Hermana", color: "#34C759", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "e52fbd1e-58c5-43be-8e05-64c8c7ad4e42" 
  },
];

const STORAGE_KEY = "listacompra_current_profile";

/**
 * Hook para manejar la sesión local del usuario de forma persistente.
 * No utiliza autenticación real, se basa en LocalStorage preparado para offline.
 */
export function useCurrentProfile() {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  // Cambiar usuario actual
  const changeProfile = (profile: LocalProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setCurrentProfile(profile);
    } catch (error) {
      console.error("Error saving profile to storage", error);
    }
  };

  // Limpiar selección (Cerrar sesión)
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
    isLoading,
    changeProfile,
    clearProfile,
    availableProfiles: FAMILY_PROFILES,
  };
}
