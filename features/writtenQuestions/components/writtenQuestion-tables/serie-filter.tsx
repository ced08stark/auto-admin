// app/dashboard/written-question/writtenQuestion-tables/SerieFilter.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SerieFilter({ series }: { series: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSerieId = searchParams.get("serieId");

  // ✨ 1. Modifiez la fonction pour gérer la nouvelle valeur "all"
  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Si la valeur est "all", on supprime le filtre. Sinon, on l'ajoute.
    if (value && value !== "all") {
      params.set("serieId", value);
    } else {
      params.delete("serieId");
    }
    
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full md:w-1/4">
      {/* ✨ 2. Si currentSerieId est nul, la valeur par défaut est "all" */}
      <Select value={currentSerieId || "all"} onValueChange={handleFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrer par série..." />
        </SelectTrigger>
        <SelectContent>
          {/* ✨ 3. Utilisez "all" comme valeur pour "Toutes les séries" */}
          <SelectItem value="all">Toutes les séries</SelectItem>
          {series.map((serie) => (
            <SelectItem key={serie._id} value={serie._id}>
              {serie.libelle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}