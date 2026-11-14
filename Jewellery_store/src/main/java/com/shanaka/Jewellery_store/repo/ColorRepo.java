package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepo extends JpaRepository<ProductColor,Long> {
}
