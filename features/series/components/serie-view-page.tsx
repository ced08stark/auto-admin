
"use client";

// ✨ 1. Importer useSearchParams depuis next/navigation
import { useSearchParams } from "next/navigation";
import { useOralQuestion } from "@/contexts/OralQuestionContext";
import { useWrittenQuestion } from "@/contexts/WrittenQuestionContext";
import { useSerie } from "@/contexts/SerieContext";
// ❌ Supprimer l'import de votre cache personnalisé
// import { searchParamsCache } from "@/lib/searchparams"; 
import { OralQuestionTable } from "../../oralQuestions/components/oralQuestion-tables";
import { WrittenQuestionTable } from "../../writtenQuestions/components/writtenQuestion-tables";
import { columns } from "../../oralQuestions/components/oralQuestion-tables/columns";
import { useMemo } from "react";

export default function SerieListingViewPage({ serieId }: { serieId?: string }) {
    // ✨ 2. Appeler le hook pour obtenir l'objet searchParams
    const searchParams = useSearchParams();
    const { oralQuestions } = useOralQuestion();
    const { writtenQuestions } = useWrittenQuestion();

    // ✨ 3. Utiliser searchParams.get() pour lire les valeurs
    // Note : .get() retourne une chaîne ou null, d'où l'utilisation de '||' pour une valeur par défaut
    //const serieId = searchParams.get("serieId") || "";
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("consigne") || "";
    const pageLimit = searchParams.get("limit") || "10";


    const filteredOral = useMemo(() => {
        let resultOral = [...oralQuestions];
        console.log("serieId", serieId);
        console.log("oralQuestions", oralQuestions);
        // Appliquer le filtre de recherche si une valeur est fournie

        // if (search) {
        //     result = result.filter((q: any) =>
        //         q.consignes.some((c: any) =>
        //             c.consigne.toLowerCase().includes(search.toLowerCase())
        //         )
        //     );
        // }

        if (serieId) {
            resultOral = resultOral.filter((q: any) => q.serieId?._id === serieId);

        }

        return resultOral;
    }, [oralQuestions, search, serieId]);

    const filteredWritten = useMemo(() => {

        let resultWritten = [...writtenQuestions];
        console.log("serieId", serieId);
        console.log("writtenQuestions", writtenQuestions);
        // Appliquer le filtre de recherche si une valeur est fournie

        // if (search) {
        //     result = result.filter((q: any) =>
        //         q.consignes.some((c: any) =>
        //             c.consigne.toLowerCase().includes(search.toLowerCase())
        //         )
        //     );
        // }

        if (serieId) {

            resultWritten = resultWritten.filter((q: any) => q.serieId?._id === serieId);
        }

        return resultWritten;
    }, [writtenQuestions, search, serieId]);

    // Assurez-vous de convertir en Nombre pour les calculs
    const start = (Number(page) - 1) * Number(pageLimit);
    const paginatedOral = filteredOral.slice(start, start + Number(pageLimit));
    const totalOral = filteredOral.length;
    const paginatedWritten = filteredWritten.slice(start, start + Number(pageLimit));
    const totalWritten = filteredWritten.length;

    return (
        <>
           
            <WrittenQuestionTable
                data={paginatedWritten}
                totalItems={totalWritten}
                columns={columns}
            // series={series}
            />
             <OralQuestionTable
                data={paginatedOral}
                totalItems={totalOral}
                columns={columns}
            // series={series}
            />
        </>

    );
}