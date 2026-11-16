// src/app/admin/products/[productId]/page.tsx
import React, { Suspense } from 'react';
import ProductViewContent from './ProductViewContent';

interface Params {
  productId: string;
}

const FullProductView = ({ params }: { params: Promise<Params> }) => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading product details...</div>}>
      {/* Pass the promise directly without 'await' */}
      <ProductViewContent params={params} />
    </Suspense>
  );
};

export default FullProductView;