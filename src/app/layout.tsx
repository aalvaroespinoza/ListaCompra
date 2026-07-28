import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-provider";

// Fuente base optimizada
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="es" className={`${inter.variable}`}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AppProviders>
          {/* Aquí irían layouts globales como Navbar móvil en el futuro */}
          <main className="flex min-h-screen flex-col">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
