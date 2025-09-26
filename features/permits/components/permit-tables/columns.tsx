'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-actions';
import { PermitType } from '@/types/data-type';

export const columns: ColumnDef<PermitType>[] = [
  {
    accessorKey: 'name',
    header: 'nom du permis',
    cell: ({ row }) => row.getValue('name') || '—',
  },
  {
    accessorKey: 'description',
    header: 'description',
    cell: ({ row }) => row.getValue('description') || '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue<Date>('createdAt');
      return new Date(date).toLocaleString();
    },
  },
  {
    id: 'actions',
    header: 'actions',
    cell: ({ row }) => {
      const { _id, name, description } = row.original;
      return (
        <CellAction
          data={{
            _id: _id ?? '',
            name,
            description,
          }}
        />
      );
    },
  },
];
