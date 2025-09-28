"use client";

import { SerieProvider } from "@/contexts/SerieContext";
import { PermitTypeProvider } from "@/contexts/PermitTypeContext";
import { WrittenQuestionProvider } from "@/contexts/WrittenQuestionContext";
import { OralQuestionProvider } from "@/contexts/OralQuestionContext";
import { UserProvider } from "@/contexts/UserContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SerieProvider>
            <PermitTypeProvider>
                <WrittenQuestionProvider>
                    <OralQuestionProvider>

                        {children}

                    </OralQuestionProvider>
                </WrittenQuestionProvider>
            </PermitTypeProvider>
        </SerieProvider>
    );
}
