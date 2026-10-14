import type { Metadata } from "next";
import "./globals.css";
import { NavigationProvider } from "@/components/navigation";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: {
    default: "Ariel AI",
    template: "%s | Ariel AI",
  },
  description: "Chat with any model using your own API key.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh">
        <NavigationProvider>{children}</NavigationProvider>
        <Toaster />
      </body>
    </html>
  );
}
