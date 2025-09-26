"use client";

import { PermitTypeProvider } from "@/contexts/PermitTypeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermitTypeProvider>
      {children}
    </PermitTypeProvider>
  );
}
