"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconEdit, IconEye, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { AlertModal } from "@/components/modal/alert-modal";
import { SerieFormModal } from "@/features/series/components/serie-form";
import { useRouter } from 'next/navigation';
import { z } from "zod";
import { usePermitType } from "@/contexts/PermitTypeContext";
import { useSerie } from "@/contexts/SerieContext";

const serieSchema = z.object({
 _id: z.string().optional(),
  libelle: z.string().min(2, "Libellé requis"),
  regulationTraffic: z.string().optional(),
  videos: z.array(z.string().url("URL invalide")).optional(),
  permitTypeId: z.string().optional(),
  isFree: z.boolean().default(true), // <- reste requis, mais avec valeur par défaut
});

type SerieFormValues = z.infer<typeof serieSchema>;

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
   const { permitTypes } = usePermitType();
   const {  editSeries, removeSeries } = useSerie();
  const router = useRouter();

  const handleUpdate = (values: any) => {
    console.log("Updating permit type:", data._id, values);
    editSeries(data._id, values);
    setOpenUpdate(false);
    // router.refresh();
    // 👉 appel API PUT /permit-types/:id
  };

  const handleDelete = () => {
    console.log("Deleting permit type:", data._id);
    removeSeries(data._id);
    setOpenDelete(false);
    router.refresh();
    // 👉 appel API DELETE /permit-types/:id
  };

  return (
    <>
      {/* Modal update */}
      <SerieFormModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        onSubmit={handleUpdate}
        initialData={data}
        permitTypes={permitTypes} // Vous pouvez passer les types de permis ici si nécessaire
      />

      {/* Modal delete */}
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        loading={false}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/serie/${data._id}`)}>
            <IconEye className="mr-2 h-4 w-4" /> Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
            <IconEdit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
