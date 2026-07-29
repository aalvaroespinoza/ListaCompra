"use client";

import React, { useState } from "react";
import { Settings, Clock, Star, MoreHorizontal, Users, ShoppingBag } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Avatar } from "@/components/ui/Avatar";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { motion } from "framer-motion";
import { ShoppingList } from "@/features/shopping-list/components/ShoppingList";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { HistoryList } from "@/features/statistics/components/HistoryList";
import { FrequentGrid } from "@/features/shopping-list/components/FrequentGrid";
import { AvatarPicker } from "@/components/shared/AvatarPicker";
import { BottomSheet } from "@/components/ui/BottomSheet";

export default function HomeWireframe() {
  const [activeTab, setActiveTab] = useState("list");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showFrequents, setShowFrequents] = useState(false);
  const { currentProfile, isLoading: isProfileLoading, changeProfile, clearProfile, availableProfiles } = useCurrentProfile();

  // Loading state 
  if (isProfileLoading) {
    return (
      <PageContainer withBottomNav={false} className="justify-center items-center p-6">
         <div className="w-full space-y-4">
           <LoadingSkeleton shape="circle" className="h-16 w-16 mx-auto mb-8" />
           <LoadingSkeleton shape="text" className="h-8 max-w-[200px] mx-auto" />
           <LoadingSkeleton shape="text" className="h-4 max-w-[150px] mx-auto" />
         </div>
      </PageContainer>
    );
  }

  // ============================================================================
  // PANTALLA INICIAL DE SELECCIÓN DE USUARIO
  // ============================================================================
  if (!currentProfile) {
    return (
      <PageContainer withBottomNav={false} className="justify-center items-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-12 pb-12">
          
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">¿Quién eres?</h1>
            <p className="text-text-secondary text-lg">Selecciona tu perfil para continuar</p>
          </div>
          
          <div data-testid="profile-selector" className="grid grid-cols-2 gap-x-6 gap-y-10 place-items-center">
            {availableProfiles.map((profile, idx) => (
              <motion.button
                data-testid="profile-btn"
                key={profile.id}
                onClick={() => changeProfile(profile)}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: idx * 0.08, 
                  duration: 0.4, 
                  type: "spring", 
                  bounce: 0.4 
                }}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-3 w-full group outline-none"
              >
                <div 
                  className="rounded-full p-1.5 transition-all duration-300 group-hover:shadow-md"
                  style={{ backgroundColor: `${profile.color}20` }}
                >
                  <Avatar 
                    src={profile.avatar_url || undefined}
                    fallback={profile.display_name} 
                    size="lg"
                    className="h-20 w-20 text-2xl shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundColor: profile.color, color: '#fff' }}
                  />
                </div>
                <span className="text-[17px] font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {profile.display_name}
                </span>
              </motion.button>
            ))}
          </div>

        </div>
      </PageContainer>
    );
  }

  // ============================================================================
  // APP PRINCIPAL
  // ============================================================================
  const date = new Date();
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const today = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${date.getDate()} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;

  return (
    <PageContainer withBottomNav={true}>
      <Header 
        avatar={
          <div data-testid="profile-avatar-btn" className="bg-primary/10 rounded-full p-1 border border-border/50 shadow-sm cursor-pointer" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <Avatar 
              src={currentProfile.avatar_url || undefined}
              fallback={currentProfile.display_name} 
              size="md"
              style={{ backgroundColor: currentProfile.color, color: '#fff' }}
              className="shadow-sm"
            />
          </div>
        }
        title={<span data-testid="header-title">{`¡Hola, ${currentProfile.display_name.split(' ')[0]}!`}</span>} 
        subtitle={today}
        rightAction={
          <div className="flex items-center gap-2">
            <div className="bg-surface rounded-full p-2.5 shadow-sm border border-border/50 cursor-pointer">
              <Users size={20} className="text-text-secondary" />
            </div>
            <div className="bg-surface rounded-full p-2.5 shadow-sm border border-border/50 cursor-pointer">
              <MoreHorizontal size={20} className="text-text-secondary" />
            </div>
          </div>
        }
      />

      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAvatarPicker(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
            <AvatarPicker onClose={() => setShowAvatarPicker(false)} />
          </div>
        </div>
      )}

      {activeTab === "list" ? (
        <ShoppingList 
          householdId={currentProfile.household_id} 
          userId={currentProfile.id} 
        />
      ) : activeTab === "settings" ? (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 pb-24">
          <div className="w-full max-w-md">
            <AvatarPicker />
          </div>
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border/50 w-full max-w-md mt-6">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Sesión y Datos</h3>
            <button 
              onClick={clearProfile}
              className="w-full py-3 bg-surface-hover text-text-primary rounded-xl font-medium transition-colors mb-4 border border-border"
            >
              Cambiar de Perfil
            </button>
            <h3 className="text-xl font-bold mb-4 text-text-primary mt-6">Zona de Peligro</h3>
            <p className="text-sm text-text-secondary mb-6">
              Esto borrará tu caché local offline y los ítems pendientes de sincronizar.
            </p>
            <button 
              onClick={async () => {
                try {
                  await db.delete();
                  localStorage.clear();
                  toast.success("Base de datos local vaciada", {
                    description: "Recargando aplicación..."
                  });
                  setTimeout(() => window.location.reload(), 1500);
                } catch (_e) {
                  toast.error("Error al vaciar DB local");
                }
              }}
              className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-medium transition-colors"
            >
              Vaciar Caché Local
            </button>
          </div>
        </div>
      ) : activeTab === "history" ? (
        <HistoryList householdId={currentProfile.household_id} />
      ) : null}

      <BottomSheet 
        isOpen={showFrequents} 
        onClose={() => setShowFrequents(false)}
        title="Productos Frecuentes"
      >
        <FrequentGrid householdId={currentProfile.household_id} userId={currentProfile.id} />
      </BottomSheet>

      <BottomNavigation
        items={[
          {
            id: "list",
            label: "Lista",
            icon: <ShoppingBag size={24} />,
            isActive: activeTab === "list",
            onClick: () => setActiveTab("list")
          },
          {
            id: "history",
            label: "Historial",
            icon: <Clock size={24} />,
            isActive: activeTab === "history",
            onClick: () => setActiveTab("history")
          },
          {
            id: "frequent",
            label: "Frecuentes",
            icon: <Star size={24} />,
            isActive: showFrequents,
            onClick: () => setShowFrequents(true)
          },
          {
            id: "settings",
            label: "Ajustes",
            icon: <Settings size={24} />,
            isActive: activeTab === "settings",
            onClick: () => setActiveTab("settings")
          }
        ]}
      />
    </PageContainer>
  );
}
