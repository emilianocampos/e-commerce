'use client';

import { useTransition } from 'react';
import { deleteProduct } from '@/actions/products';
import { Button } from '@/components/Button';

interface DeleteProductButtonProps {
  id: string;
  title: string;
}

export function DeleteProductButton({ id, title }: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${title}"? Esta acción no se puede deshacer.`)) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (result?.error) {
          alert(`Error al eliminar: ${result.error}`);
        }
      });
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  );
}
