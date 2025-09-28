'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { WrittenQuestion } from '@/types/data-type';
import { MediaPreview } from '@/components/MediaPreview';

export const columns: ColumnDef<WrittenQuestion>[] = [
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
      const libelles = row.getValue<WrittenQuestion['libelles']>('libelles');
      return (
        <div className="flex flex-col gap-1">
          {libelles?.map((l, idx) => (
           l?.typeLibelle === 'texte' ? (
            <div key={idx} className="p-2 border rounded-md">
              <p className="font-medium">{l.libelle}</p>
            </div>
           ) : 
            <MediaPreview
              key={idx}
              type={l.typeLibelle}
              action={false}
              uploadedFile={{
                file: new File([], l.libelle), // Fichier fictif pour l'affichage
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/${l.libelle}`, // URL de la vidéo ou audio
                uploadProgress: 100,
                isUploading: false,
                uploadSuccess: true
              }}
              onRemove={() => {}}
            />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'consignes',
    header: 'Consignes',
    cell: ({ row }) => {
      const consignes = row.getValue<WrittenQuestion['consignes']>('consignes');
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
     accessorFn: (row : WrittenQuestion) => row.serieId?.libelle,
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
