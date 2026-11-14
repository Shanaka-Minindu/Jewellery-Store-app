"use client"
import AllProduct from '@/components/ui/AllProduct'
import { AllProductResDto } from '@/types/product';
import { useRouter } from 'next/navigation';
import React from 'react'

const AllProductPage = () => {
    const router = useRouter();

    function selectedItem(productId:number){
                router.push(`/admin/products/${productId}`); 
    }

  return (
    <div><AllProduct seletedProductId={selectedItem}/></div>
  )
}

export default AllProductPage