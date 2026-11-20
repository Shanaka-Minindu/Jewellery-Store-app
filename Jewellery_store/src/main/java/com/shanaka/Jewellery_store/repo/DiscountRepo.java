package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiscountRepo extends JpaRepository<DiscountCode, Long> {

    Optional<DiscountCode> findByDiscountCodeIgnoreCase(String discountCode);

    boolean existsByDiscountCodeIgnoreCase(String discountCode);
}