import type { Metadata } from "next";
import { Inter, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/Navbar";
import { ReactNode } from "react";


const inter = Inter({ subsets: ["latin"]});
const notoSansHebrew = Noto_Sans_Hebrew({ 
  subsets: ["hebrew"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "אלוהים אדם ומכונה",
  description: "בלוג פילוסופי על טכנולוגיה ויהדות",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`app-wrapper ${notoSansHebrew.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="main-section max-w-screen-md mx-auto px-4 pt-8">{children}</main>
          <footer className="max-w-screen-md mx-auto px-4">
            <p className="text-center text-gray-600 dark:text-gray-300 py-3">
              {new Date().getFullYear()} Maor Elimelech
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
