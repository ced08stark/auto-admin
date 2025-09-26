// app/dashboard/written-question/WrittenQuestionListingPage.tsx
"use client";

import { useWrittenQuestion } from "@/contexts/WrittenQuestionContext";
import { searchParamsCache } from "@/lib/searchparams";
import { WrittenQuestionTable } from "./writtenQuestion-tables";
import { columns } from "./writtenQuestion-tables/columns";
import { useMemo } from "react";

export default function WrittenQuestionListingPage() {
  const { writtenQuestions } = useWrittenQuestion();
  console.log("writtenQuestions:", writtenQuestions);
  const page = writtenQuestions.lenght > 0 ? searchParamsCache.get("page") : 1;
  const search = writtenQuestions.lenght > 0 ? searchParamsCache.get("consigne") : "";
  const pageLimit = writtenQuestions.lenght > 0 ? searchParamsCache.get("limit") : 10;

  const filtered = useMemo(() => {
    let result = [...writtenQuestions];
    if (search) {
      result = result.filter((q: any) =>
        q.consignes.some((c: any) =>
          c.consigne.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return result;
  }, [writtenQuestions, search]);

  const start = (Number(page) - 1) * Number(pageLimit);
  const paginated = filtered.slice(start, start + Number(pageLimit));
  const total = filtered.length;

  return (
    <WrittenQuestionTable data={paginated} totalItems={total} columns={columns} />
  );
}
