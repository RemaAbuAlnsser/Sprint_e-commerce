import type { Metadata } from "next";
import { Cairo, Tajawal, Amiri } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "متجر Sprint - تسوق بثقة وسهولة",
  description: "متجرك الإلكتروني الموثوق للتسوق الآمن والسريع",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="http://104.234.26.192:3000/uploads/companies/company-1769093110255-195980110.png" type="image/png" />
        <link rel="shortcut icon" href="http://104.234.26.192:3000/uploads/companies/company-1769093110255-195980110.png" type="image/png" />
        <link rel="apple-touch-icon" href="http://104.234.26.192:3000/uploads/companies/company-1769093110255-195980110.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="http://104.234.26.192:3000/uploads/companies/company-1769093110255-195980110.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="http://104.234.26.192:3000/uploads/companies/company-1769093110255-195980110.png" />
      </head>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${amiri.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
