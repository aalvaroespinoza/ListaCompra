"use client";

import React from "react";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { profileRepository } from "@/repositories/profile-repository";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function AvatarPicker({ onClose }: { onClose?: () => void }) {
  const { currentProfile, changeProfile } = useCurrentProfile();
  const queryClient = useQueryClient();
  
  const seeds = React.useMemo(() => [
    "Felix", "Jasper", "Luna", "Milo", "Oliver", "Bella", "Charlie", "Max"
  ], []);

  const selectAvatar = async (seed: string) => {
    if (!currentProfile) return;
    const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
    
    try {
      await profileRepository.updateAvatar(currentProfile.id, url);
      
      changeProfile({ ...currentProfile, avatar_url: url });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      toast.success("Avatar actualizado");
      if (onClose) onClose();
    } catch (e) {
      toast.error("Error al actualizar el avatar");
    }
  };

  return (
    <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
      <h3 className="text-sm font-bold text-text-primary mb-4 text-center">Elige tu avatar</h3>
      <div className="grid grid-cols-4 gap-4">
        {seeds.map(seed => {
          const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
          const isSelected = currentProfile?.avatar_url === url;
          return (
            <button 
              key={seed} 
              onClick={() => selectAvatar(seed)}
              className={`relative rounded-full aspect-square overflow-hidden border-2 transition-transform active:scale-95 ${isSelected ? 'border-primary' : 'border-transparent hover:border-border-hover'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Avatar ${seed}`} className="w-full h-full object-cover bg-background" />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="text-primary bg-white rounded-full p-0.5" size={20} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
