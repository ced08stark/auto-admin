"use client";

import { usePermitType } from "@/contexts/PermitTypeContext";
import { searchParamsCache } from "@/lib/searchparams";
import { PermitTypeTable } from "./permit-tables";
import { columns } from "./permit-tables/columns";
import { useMemo } from "react";

export default function PermitTypeListingPage() {
  const { permitTypes } = usePermitType();
  console.log(permitTypes);
  const page = permitTypes.length < 0 ? searchParamsCache.get("page") : 1;
  const search = permitTypes.length < 0 ? searchParamsCache.get("name") : "";
  const pageLimit = permitTypes.length < 0 ? searchParamsCache.get("limit") : 10;

  const filtered = useMemo(() => {
    let result = [...permitTypes];
    if (search) {
      result = result.filter((q: any) =>
        q.name.some((c: any) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return result;
  }, [permitTypes, search]);

  const start = (Number(page) - 1) * Number(pageLimit);
  const paginated = filtered.slice(start, start + Number(pageLimit));
  const total = filtered.length;

  return (
    <PermitTypeTable data={paginated} totalItems={total} columns={columns} />
  );
}
