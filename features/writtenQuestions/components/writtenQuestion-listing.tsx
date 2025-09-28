// app/dashboard/written-question/WrittenQuestionListingPage.tsx
"use client";

// ✨ 1. Importer useSearchParams depuis next/navigation
import { useSearchParams } from "next/navigation";
import { useWrittenQuestion } from "@/contexts/WrittenQuestionContext";
import { useSerie } from "@/contexts/SerieContext";
// ❌ Supprimer l'import de votre cache personnalisé
// import { searchParamsCache } from "@/lib/searchparams"; 
import { WrittenQuestionTable } from "./writtenQuestion-tables";
import { columns } from "./writtenQuestion-tables/columns";
import { useMemo } from "react";

export default function WrittenQuestionListingPage() {
  // ✨ 2. Appeler le hook pour obtenir l'objet searchParams
  const searchParams = useSearchParams();
  const { writtenQuestions } = useWrittenQuestion();
  const { series } = useSerie();

  // ✨ 3. Utiliser searchParams.get() pour lire les valeurs
  // Note : .get() retourne une chaîne ou null, d'où l'utilisation de '||' pour une valeur par défaut
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("consigne") || "";
  const pageLimit = searchParams.get("limit") || "10";
  const serieId = searchParams.get("serieId") || "";

  const filtered = useMemo(() => {
    let result = [...writtenQuestions];

    if (search) {
      result = result.filter((q: any) =>
        q.consignes.some((c: any) =>
          c.consigne.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (serieId) {
      result = result.filter((q: any) => q.serieId?._id === serieId);
    }

    return result;
  }, [writtenQuestions, search, serieId]);

  // Assurez-vous de convertir en Nombre pour les calculs
  const start = (Number(page) - 1) * Number(pageLimit);
  const paginated = filtered.slice(start, start + Number(pageLimit));
  const total = filtered.length;

  return (
    <WrittenQuestionTable
      data={paginated}
      totalItems={total}
      columns={columns}
      series={series}
    />
  );
}