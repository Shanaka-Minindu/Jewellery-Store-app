package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category,Long> {
}
