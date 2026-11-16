import React, { Suspense } from 'react';
import { ProductsView } from '@/components/ProductsView';

interface Params {
  gender: string;
}

interface SearchParams {
  category?: string;
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const gender = resolvedParams.gender;
  const categoryId = resolvedSearch?.category ? Number(resolvedSearch.category) : undefined;
console.log(gender + "  "+categoryId)
  return (
    <main className="min-h-screen bg-white pb-16">
      <Suspense fallback={<div className="py-20 text-center">Loading store...</div>}>
        <ProductsView
          gender={gender}
          initialCategoryId={categoryId}
        />
      </Suspense>
    </main>
  );
}