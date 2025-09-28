'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Serie } from '@/types/data-type';
import { useDataTable } from '@/hooks/use-data-table';
import { SerieFilter } from "./serie-filter";
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
interface ProductTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  series?: Serie[]
}
export function WrittenQuestionTable<TData, TValue>({
  data,
  totalItems,
  columns,
  series
}: ProductTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data, // product data
    columns, // product columns
    pageCount: pageCount,
    shallow: false, //Setting to false triggers a network request with the updated querystring.
    debounceMs: 500
  });

  return (
    <>
     {series && series.length > 0 && <div className="flex items-center justify-between mb-4">
        {/* Barre de recherche existante (si vous en avez une) */}

        {/* ✨ 3. Ajouter le composant de filtre */}
        <SerieFilter series={series ?? []} />

        {/* Bouton "Ajouter une question" (si vous en avez un) */}
      </div>}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </>

  );
}
