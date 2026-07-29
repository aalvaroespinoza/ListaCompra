"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileRepository } from "@/repositories/profile-repository";
import type { LocalProfile } from "@/repositories/profile-repository";

export type { LocalProfile };

const STORAGE_KEY = "listacompra_current_profile";

/**
 * Hook para manejar la sesión local del usuario de forma persistente.
 * Delega el acceso a datos a ProfileRepository — no conoce Supabase directamente.
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

  const { data: availableProfiles = [], isLoading: isProfilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => profileRepository.fetchAll(),
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
