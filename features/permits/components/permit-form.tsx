"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const permitTypeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
});

type PermitTypeFormValues = z.infer<typeof permitTypeSchema>;

interface PermitTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PermitTypeFormValues) => void;
  initialData?: PermitTypeFormValues | null;
}

export const PermitTypeFormModal: React.FC<PermitTypeFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const form = useForm<PermitTypeFormValues>({
    resolver: zodResolver(permitTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleCreate = (values: any) => {
    console.log("Creating permit type:", values);
    // 👉 appel API POST /permit-types
  };

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [initialData, form]);

  const handleSubmit = (values: PermitTypeFormValues) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Permit Type" : "Create Permit Type"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modify the details of the permit type."
              : "Fill in the form to create a new permit type."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Name"
              {...form.register("name")}
              defaultValue={form.getValues("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Input
              placeholder="Description"
              {...form.register("description")}
              defaultValue={form.getValues("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
