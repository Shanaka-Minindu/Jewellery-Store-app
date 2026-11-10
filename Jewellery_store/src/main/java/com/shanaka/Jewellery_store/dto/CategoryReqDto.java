package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.Gender;
import lombok.Data;

@Data
public class CategoryReqDto {
    private String title;
    private Gender gender;
}
