'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-actions';
import { OralQuestion } from '@/types/data-type';

export const columns: ColumnDef<OralQuestion>[] = [
  {
    accessorKey: 'numero',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Numéro' />
    ),
  },
  {
    accessorKey: 'libelles',
    header: 'Libellés',
    cell: ({ row }) => {
      const libelles = row.getValue<OralQuestion['libelles']>('libelles');
      return (
        <div className="flex flex-col gap-1">
          {libelles?.map((l, idx) => (
            <Badge key={idx} variant="outline">
              {l.libelle} ({l.typeLibelle})
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'consignes',
    header: 'Consignes',
    cell: ({ row }) => {
      const consignes = row.getValue<OralQuestion['consignes']>('consignes');
      return (
        <div className="flex flex-col gap-2">
          {consignes?.map((c, idx) => (
            <div key={idx} className="p-2 border rounded-md">
              <p className="font-medium">{c.consigne}</p>
              <ul className="ml-4 list-disc text-sm">
                {c.suggestions?.map((s, i) => (
                  <li key={i} className={s.isCorrect ? 'text-green-600' : 'text-red-600'}>
                    {s.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'duree',
    header: 'Durée (min)',
    cell: ({ row }) => row.getValue('duree') || '—',
  },
  {
    id: 'serie', // A unique ID for the column
    header: 'Serie',
    // Use an accessor function to safely access the nested property
    accessorFn: (row : OralQuestion) => row.serieId?.libelle,
    // The cell can now get the pre-calculated value from the accessorFn
    cell: (info) => info.getValue() || '—',
  },
  {
    accessorKey: 'startedAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue<Date>('startedAt');
      return new Date(date).toLocaleString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
