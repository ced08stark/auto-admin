'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { User } from '@/types/data-type';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nom' />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => {
      const role = row.getValue<User['role']>('role');
      return (
        <Badge variant={role === 'admin' ? 'default' : 'outline'}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'codePromo',
    header: 'Code Promo',
  },
  {
    accessorKey: 'parrain',
    header: 'Parrain',
    cell: ({ row }) => row.getValue('parrain') || '—',
  },
  {
    accessorKey: 'solde',
    header: 'Solde',
    cell: ({ row }) => row.getValue('solde') ?? 0,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue<Date>('createdAt');
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
