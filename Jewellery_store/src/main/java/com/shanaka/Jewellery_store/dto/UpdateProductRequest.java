package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.Gender;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProductRequest {
    private String title;
    private String description;
    private Gender productFor;
    private String size;
    private boolean isNewArrival;
    private boolean hidePrice;
    private Long categoryId;
    private List<UpdateVariantDto> variants;
}