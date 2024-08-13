import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TodoProvider } from "@/context/TodoContext";
import { ThemeProvider } from "@/context/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo Streak App",
  description: "Make your daily tasks easier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <TodoProvider>{children}</TodoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
