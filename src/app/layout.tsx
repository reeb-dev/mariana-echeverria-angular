import type { Metadata } from "next";
import { Cormorant_Garamond, Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mariana Echeverría Bienes Raíces | Demo",
  description:
    "Demo de rediseño para Mariana Echeverría Bienes Raíces: venta, alquiler, tasaciones y desarrollos en Zona Norte, CABA y Coronel Suárez.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${figtree.variable} ${cormorant.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
