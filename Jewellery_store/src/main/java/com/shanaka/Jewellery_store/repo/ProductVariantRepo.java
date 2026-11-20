package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepo extends JpaRepository<ProductVariant,Long> {
}
