"use client";

import { OralQuestionProvider } from "@/contexts/OralQuestionContext";
import { SerieProvider } from "@/contexts/SerieContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <OralQuestionProvider>
      <SerieProvider>
        {children}
      </SerieProvider>
    </OralQuestionProvider>
  );
}
