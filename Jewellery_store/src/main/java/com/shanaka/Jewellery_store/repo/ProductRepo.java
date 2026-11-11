package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product,Long> {
}
