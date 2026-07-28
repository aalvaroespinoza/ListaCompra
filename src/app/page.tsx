"use client";

import React, { useState } from "react";
import { List, Settings, LogOut } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Avatar } from "@/components/ui/Avatar";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { motion } from "framer-motion";
import { ShoppingList } from "@/features/shopping-list/components/ShoppingList";

export default function HomeWireframe() {
  const [activeTab, setActiveTab] = useState("list");
  const { currentProfile, isLoading, changeProfile, clearProfile, availableProfiles } = useCurrentProfile();

  // Loading state 
  if (isLoading) {
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
  return (
    <PageContainer withBottomNav={true}>
      <Header 
        title="Mercado" 
        subtitle="3 artículos pendientes"
        rightAction={
          <div className="flex items-center gap-2">
            <Avatar 
              fallback={currentProfile.display_name} 
              size="md"
              style={{ backgroundColor: currentProfile.color, color: '#fff' }}
            />
            {/* Opción futura: Cambiar usuario */}
            <IconButton variant="ghost" size="sm" onClick={clearProfile} title="Cambiar usuario">
              <LogOut size={20} className="text-danger" />
            </IconButton>
          </div>
        }
      />

      <ShoppingList 
        householdId={currentProfile.household_id} 
        userId={currentProfile.id} 
      />

      <BottomNavigation
        items={[
          {
            id: "list",
            label: "Lista",
            icon: <List size={24} />,
            isActive: activeTab === "list",
            onClick: () => setActiveTab("list")
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
