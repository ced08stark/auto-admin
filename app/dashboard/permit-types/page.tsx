"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";
import { PermitTypeFormModal } from "@/features/permits/components/permit-form";
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PermitTypeListingPage from '@/features/permits/components/permit-listing';
import { usePermitType } from "@/contexts/PermitTypeContext";


export default function Page() {
  const [openModal, setOpenModal] = useState(false);
  const { createPermitTypes } = usePermitType()

  const handleCreate = (values: any) => {
    console.log("Creating permit type:", values);
    createPermitTypes(values)
    // 👉 appel API POST /permit-types
  };

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Permit types"
            description="Manage permit types"
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
          <PermitTypeListingPage />
        </Suspense>
        <PermitTypeFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreate}
        />
      </div>
    </PageContainer>
  );
}
