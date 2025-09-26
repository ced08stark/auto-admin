// app/dashboard/written-question/WrittenQuestionListingPage.tsx
"use client";

import { useSerie } from "@/contexts/SerieContext";
import { searchParamsCache } from "@/lib/searchparams";
import { SerieTable } from "./serie-tables";
import { columns } from "./serie-tables/columns";
import { useMemo } from "react";

export default function SerieListingPage() {
  const { series } = useSerie();

  const page = series.lenght > 0 ? searchParamsCache.get("page") : 1;
  const search = series.lenght > 0 ? searchParamsCache.get("libelle") : "";
  const pageLimit = series.lenght > 0 ? searchParamsCache.get("limit") : 10;

  const filtered = useMemo(() => {
    let result = [...series];
    if (search) {
      result = result.filter((q: any) =>
        q.libelle.some((c: any) =>
          c.libelle.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return result;
  }, [series, search]);

  const start = (Number(page) - 1) * Number(pageLimit);
  const paginated = filtered.slice(start, start + Number(pageLimit));
  const total = filtered.length;

  return (
    <SerieTable data={paginated} totalItems={total} columns={columns} />
  );
}
