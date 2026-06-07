import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoMentor - AI GitHub Project Mentor",
  description:
    "Understand any open-source repository. Get setup guides, tech stack analysis, good first issues, and a personalized learning path.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
