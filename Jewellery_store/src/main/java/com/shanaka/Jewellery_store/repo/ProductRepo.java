package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepo extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
}
