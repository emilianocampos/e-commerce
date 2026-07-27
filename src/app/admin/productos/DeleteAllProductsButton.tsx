'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { deleteAllProducts } from '@/actions/products';
import { showToast } from 'nextjs-toast-notify';

export function DeleteAllProductsButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los productos? Esta acción no se puede deshacer.')) {
      setIsDeleting(true);
      const res = await deleteAllProducts();
      if (res.error) {
        showToast.error(`Error: ${res.error}`, { position: 'top-center' });
      } else {
        showToast.success('Todos los productos han sido eliminados.', { position: 'top-center' });
      }
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar Todos'}
    </Button>
  );
}
