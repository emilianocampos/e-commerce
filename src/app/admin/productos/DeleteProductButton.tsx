'use client';

import { useTransition } from 'react';
import { deleteProduct } from '@/actions/products';
import { Button } from '@/components/Button';
import { showToast } from 'nextjs-toast-notify';

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
          showToast.error(`Error al eliminar: ${result.error}`, { position: 'top-center' });
        } else {
          showToast.success('Producto eliminado correctamente', { position: 'top-center' });
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
