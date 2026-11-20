package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryInfoRepo extends JpaRepository<DeliveryInfo, Long> {
    Optional<DeliveryInfo> findFirstByUserIdOrderByIdDesc(Long userId);
}