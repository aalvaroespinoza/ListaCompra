import type { Metadata, Viewport } from "next";
import { Inter, Fredoka, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "ListaCompra",
  description: "Lista de compras familiar en tiempo real",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Se funde con el notch/isla dinámica
    title: "ListaCompra",
  },
  formatDetection: {
    telephone: false, // Evitar que convierta números de cantidad en enlaces
  }
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // Expande al 100% de la pantalla (debajo del notch) en iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${fredoka.variable} ${jetbrains.variable}`}>
      <body className="font-sans bg-background text-text-primary antialiased selection:bg-primary/20 selection:text-primary">
        <AppProviders>
          {/* Aquí irían layouts globales como Navbar móvil en el futuro */}
          <main className="flex min-h-screen flex-col">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
