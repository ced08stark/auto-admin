"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";
import { SerieFormModal } from "@/features/series/components/serie-form";
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import SerieListingPage from '@/features/series/components/serie-listing';
import { useSerie } from "@/contexts/SerieContext";
import { usePermitType } from "@/contexts/PermitTypeContext";

export default  function Page() {
    const [openModal, setOpenModal] = useState(false);
      const { permitTypes } = usePermitType();
      const { createSeries } = useSerie();

    const handleCreate = (values: any) => {
        console.log("Creating permit type:", values);
        createSeries(values);
        setOpenModal(false);
        // 👉 appel API POST /permit-types
    };

    return (
        <PageContainer scrollable={false}>
            <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Series"
                        description="Manage series"
                    />
                    <button
                        onClick={() => setOpenModal(true)}
                        className={cn(buttonVariants(), "text-xs md:text-sm")}
                    >
                        <IconPlus className="mr-2 h-4 w-4" /> Add New
                    </button>
                </div>
                <Separator />
                {/* TABLE */}
                <Suspense
                    // key={key}
                    fallback={
                        <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
                    }
                >
                    <SerieListingPage />
                </Suspense>

                {/* TABLE */}

                <SerieFormModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSubmit={handleCreate}
                    permitTypes={permitTypes}
                />
            </div>
        </PageContainer>
    );
}
