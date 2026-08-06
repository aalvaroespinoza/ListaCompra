"use client";

import { useState, useEffect } from "react";

export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visualViewport = window.visualViewport;
    
    if (!visualViewport) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewportHeight(window.innerHeight);
      return;
    }

    const handleResize = () => {
      setViewportHeight(visualViewport.height);
      
      // En iOS standalone, window.innerHeight no cambia, pero visualViewport.height sí.
      // Calculamos cuánto se encogió el viewport (presumiblemente por el teclado).
      const offset = Math.max(0, window.innerHeight - visualViewport.height);
      setKeyboardOffset(offset);
    };

    // Llamada inicial
    handleResize();

    visualViewport.addEventListener("resize", handleResize);
    visualViewport.addEventListener("scroll", handleResize);
    
    return () => {
      visualViewport.removeEventListener("resize", handleResize);
      visualViewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  return { viewportHeight, keyboardOffset };
}
