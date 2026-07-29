"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden h-[75vh] flex flex-col"
          >
            <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0 bg-surface rounded-t-[32px]">
              <div className="w-12 h-1.5 rounded-full bg-border-hover/80" />
            </div>
            
            {title && (
              <div className="px-6 pb-4 shrink-0 bg-surface border-b border-border/40">
                <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto overscroll-contain bg-background">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
