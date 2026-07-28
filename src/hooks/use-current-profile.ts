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
    id: "user-1", display_name: "Alvaro", color: "#007AFF", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "house-1" 
  },
  { 
    id: "user-2", display_name: "Mamá", color: "#FF2D55", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "house-1" 
  },
  { 
    id: "user-3", display_name: "Papá", color: "#5856D6", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "house-1" 
  },
  { 
    id: "user-4", display_name: "Hermano", color: "#FF9500", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "house-1" 
  },
  { 
    id: "user-5", display_name: "Hermana", color: "#34C759", 
    avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), household_id: "house-1" 
  },
];

const STORAGE_KEY = "listacompra_current_profile";

/**
 * Hook para manejar la sesión local del usuario de forma persistente.
 * No utiliza autenticación real, se basa en LocalStorage preparado para offline.
 */
export function useCurrentProfile() {
  const [currentProfile, setCurrentProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario persistido al montar el componente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error reading profile from storage", error);
    } finally {
      setIsLoading(false);
    }
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
