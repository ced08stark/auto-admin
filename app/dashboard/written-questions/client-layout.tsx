"use client";

import { WrittenQuestionProvider } from "@/contexts/WrittenQuestionContext";
import { SerieProvider } from "@/contexts/SerieContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WrittenQuestionProvider>
      <SerieProvider>
        {children}
      </SerieProvider>
    </WrittenQuestionProvider>
  );
}
