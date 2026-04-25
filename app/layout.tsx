import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";

const poppins = Poppins({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simone Pizzi | Portfolio Creativo",
  description: "Portfolio Creativo, Game Design, Sviluppo Software e Pubblicazioni",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={poppins.className}>
      <body className="bg-black text-gray-200 antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}