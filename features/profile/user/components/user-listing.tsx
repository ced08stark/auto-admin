"use client";

import { useUser } from "@/contexts/UserContext";
import { searchParamsCache } from "@/lib/searchparams";
import { UserTable } from "./user-tables";
import { columns } from "./user-tables/columns";
import { useMemo } from "react";

export default function UserListingPage() {
  const { users } = useUser();

  const page = searchParamsCache.get("page") || 1;
  const search = searchParamsCache.get("name") || "";
  const pageLimit = searchParamsCache.get("limit") || 10;

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search) {
      result = result.filter((u: any) =>
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result;
  }, [users, search]);

  const start = (Number(page) - 1) * Number(pageLimit);
  const paginatedUsers = filteredUsers.slice(
    start,
    start + Number(pageLimit)
  );

  const totalUsers = filteredUsers.length;

  return (
    <UserTable
      data={paginatedUsers}
      totalItems={totalUsers}
      columns={columns}
    />
  );
}
