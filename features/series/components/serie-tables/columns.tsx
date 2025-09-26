'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-actions';
import { Serie } from '@/types/data-type'; // adapte l'import si nécessaire

export const columns: ColumnDef<Serie>[] = [
  {
    accessorKey: 'libelle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Libellé" />
    ),
  },
  {
    accessorKey: 'regulationTraffic',
    header: 'Réglementation',
    cell: ({ row }) => row.getValue('regulationTraffic') || '—',
  },
  {
    accessorKey: 'videos',
    header: 'Vidéos',
    cell: ({ row }) => {
      const videos = row.getValue<string[]>('videos');
      return videos?.length ? (
        <span>{videos.length} vidéo(s)</span>
      ) : (
        '—'
      );
    },
  },
  {
    accessorKey: 'isFree',
    header: 'Gratuit',
    cell: ({ row }) => {
      const isFree = row.getValue<boolean>('isFree');
      return (
        <Badge variant={isFree ? 'default' : 'destructive'}>
          {isFree ? 'Oui' : 'Non'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'startedAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue<Date>('startedAt');
      return date ? new Date(date).toLocaleDateString() : '—';
    },
  },
  {
    accessorKey: 'permitTypeId',
    header: 'Type de permis',
    cell: ({ row }) => {
      // Selon si tu populates ou non
      const permit = row.getValue<any>('permitTypeId');
      return typeof permit === 'object' && permit?.name
        ? permit.name
        : '—';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const data = row.original;
      return <CellAction data={data} />;
    },
  },
];
