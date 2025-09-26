"use client";

import { useOralQuestion } from "@/contexts/OralQuestionContext";
import { searchParamsCache } from "@/lib/searchparams";
import { OralQuestionTable } from "./oralQuestion-tables";
import { columns } from "./oralQuestion-tables/columns";
import { useMemo } from "react";

export default function OralQuestionListingPage() {
  const { oralQuestions } = useOralQuestion();

  const page = oralQuestions.lenght > 0 ? searchParamsCache.get("page") : 1;
  const search = oralQuestions.lenght > 0 ? searchParamsCache.get("consigne") : "";
  const pageLimit = oralQuestions.lenght > 0 ? searchParamsCache.get("limit") : 10;

  const filtered = useMemo(() => {
    let result = [...oralQuestions];
    if (search) {
      result = result.filter((q: any) =>
        q.consignes.some((c: any) =>
          c.consigne.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return result;
  }, [oralQuestions, search]);

  const start = (Number(page) - 1) * Number(pageLimit);
  const paginated = filtered.slice(start, start + Number(pageLimit));
  const total = filtered.length;

  return (
    <OralQuestionTable data={paginated} totalItems={total} columns={columns} />
  );
}
