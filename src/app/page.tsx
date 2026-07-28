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

export default function HomeWireframe() {
  const [activeTab, setActiveTab] = useState("list");
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
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 place-items-center">
            {availableProfiles.map((profile, idx) => (
              <motion.button
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
          <div className="bg-primary/10 rounded-full p-1 border border-border/50 shadow-sm cursor-pointer" onClick={clearProfile}>
            <Avatar 
              fallback={currentProfile.display_name} 
              size="md"
              style={{ backgroundColor: currentProfile.color, color: '#fff' }}
              className="shadow-sm"
            />
          </div>
        }
        title={`¡Hola, ${currentProfile.display_name.split(' ')[0]}!`} 
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

      {activeTab === "list" ? (
        <ShoppingList 
          householdId={currentProfile.household_id} 
          userId={currentProfile.id} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center text-text-tertiary h-64">
          <div className="bg-surface rounded-full p-4 shadow-sm mb-4">
            {activeTab === "history" && <Clock size={32} className="opacity-50" />}
            {activeTab === "frequent" && <Star size={32} className="opacity-50" />}
            {activeTab === "settings" && <Settings size={32} className="opacity-50" />}
          </div>
          <p className="text-lg font-medium text-text-secondary">Próximamente</p>
        </div>
      )}

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
            isActive: activeTab === "frequent",
            onClick: () => setActiveTab("frequent")
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
