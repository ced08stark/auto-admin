"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconEdit, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { AlertModal } from "@/components/modal/alert-modal";
import { PermitTypeFormModal } from "@/features/permits/components/permit-form";
import { usePermitType } from "@/contexts/PermitTypeContext";

interface CellActionProps {
  data: { _id: string; name: string; description?: string };
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const { editPermitTypes, removePermitTypes } = usePermitType()

  const handleUpdate = (values: any) => {
    console.log("Updating permit type:", data._id, values);
    editPermitTypes(data._id, values)
    // 👉 appel API PUT /permit-types/:id
  };

  const handleDelete = () => {
    console.log("Deleting permit type:", data._id);
    removePermitTypes(data._id)
    // 👉 appel API DELETE /permit-types/:id
  };

  return (
    <>
      {/* Modal update */}
      <PermitTypeFormModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        onSubmit={handleUpdate}
        initialData={data}
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
