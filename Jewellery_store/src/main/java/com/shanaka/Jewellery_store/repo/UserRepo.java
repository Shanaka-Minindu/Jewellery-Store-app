package com.shanaka.Jewellery_store.repo;

import com.shanaka.Jewellery_store.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User,Long> {
}
