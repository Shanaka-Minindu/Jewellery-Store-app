package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.Gender;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResDto {
    private Long id;
    private String title;
    private Gender gender;
    private int productCount;
}
