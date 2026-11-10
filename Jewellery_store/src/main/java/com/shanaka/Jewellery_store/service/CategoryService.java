package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.dto.CategoryReqDto;
import com.shanaka.Jewellery_store.dto.CategoryResDto;
import com.shanaka.Jewellery_store.model.Category;
import com.shanaka.Jewellery_store.repo.CategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepo categoryRepo;

    @Transactional
    public Category createCategory(CategoryReqDto catData){
        Category newCate = Category.builder()
                .name(catData.getTitle())
                .targetGender(catData.getGender())
                .build();
        return categoryRepo.save(newCate);
    }

    @Transactional(readOnly = true)
    public List<Category> getCategories(){
        return categoryRepo.findAll();
    }

    @Transactional
    public Optional<Category> findCategoryById(Long id){
        return categoryRepo.findById(Long.valueOf(id));
    }

    @Transactional
    public void deleteCategory(Long id){
       categoryRepo.deleteById(id);
    }
}
