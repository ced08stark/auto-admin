"use client";

import { SerieProvider } from "@/contexts/SerieContext";
import { PermitTypeProvider } from "@/contexts/PermitTypeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SerieProvider>
            <PermitTypeProvider>
                {children}
            </PermitTypeProvider>
        </SerieProvider>
    );
}
