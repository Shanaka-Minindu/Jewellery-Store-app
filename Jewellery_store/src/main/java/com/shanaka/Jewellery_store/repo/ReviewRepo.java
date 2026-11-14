package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepo extends JpaRepository<Review,Long> {
    List<Review> findAllByProductId(Long product_id);
}
