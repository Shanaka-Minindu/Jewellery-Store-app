package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.dto.BasicResDto;
import com.shanaka.Jewellery_store.dto.CategoryReqDto;
import com.shanaka.Jewellery_store.dto.CategoryResDto;
import com.shanaka.Jewellery_store.model.Category;
import com.shanaka.Jewellery_store.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/addcategory")
    public ResponseEntity<CategoryResDto> createCategory(@RequestBody CategoryReqDto categoryData){

        Category category =  categoryService.createCategory(categoryData);

        CategoryResDto categoryResDto = CategoryResDto.builder()
                .id(category.getId())
                .title(category.getName())
                .build();
        return new ResponseEntity<>(categoryResDto, HttpStatus.OK);
    }

    @GetMapping("/categories")
    public ResponseEntity<ArrayList<CategoryResDto>> getCategories(){
        List<Category> categories = categoryService.getCategories();
        ArrayList<CategoryResDto> allData = new ArrayList<>();
        for(Category category: categories){
            CategoryResDto categoryResDto = CategoryResDto.builder()
                    .title(category.getName())
                    .id(category.getId())
                    .productCount(category.getProducts().size())
                    .gender(category.getTargetGender())
                    .build();
            allData.add(categoryResDto);
        }
        return new ResponseEntity<>(allData,HttpStatus.OK);
    }

    @DeleteMapping("/category/{categoryId}")
    public ResponseEntity<BasicResDto> deleteCategory(@PathVariable Integer categoryId){
       Optional<Category> category= categoryService.findCategoryById(Long.valueOf(categoryId));

        BasicResDto basicResDto;

       if(category.isEmpty()){
           basicResDto= BasicResDto.builder()
                   .message("Category not found")
                   .build();


           return new ResponseEntity<>(basicResDto,HttpStatus.NOT_FOUND);
       } else if (category.get().getProducts().size()>0) {
           basicResDto= BasicResDto.builder()
                   .message("First you need to delete All products belongs to this category")
                   .build();
           return new ResponseEntity<>(basicResDto,HttpStatus.BAD_REQUEST);

       }else {
           categoryService.deleteCategory(Long.valueOf(categoryId));
           basicResDto= BasicResDto.builder()
                   .message("Category deleted successfully")
                   .id(Long.valueOf(categoryId))
                   .build();
           return new ResponseEntity<>(basicResDto,HttpStatus.OK);
       }
    }

}
