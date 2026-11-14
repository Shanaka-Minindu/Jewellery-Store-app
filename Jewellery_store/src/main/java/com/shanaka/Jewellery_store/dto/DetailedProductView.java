package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.Category;
import com.shanaka.Jewellery_store.model.Gender;
import com.shanaka.Jewellery_store.model.ProductVariant;
import com.shanaka.Jewellery_store.model.Review;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;


@Data
@Builder
public class DetailedProductView {
    private Long id;
    private String title;
    private String description;
    private Gender productFor;
    private String size;
    private boolean isNewArrival;
    private boolean hidePrice;
    private Category category;
    private List<Review> reviews = new ArrayList<>();
    private List<ProductVariant> variants = new ArrayList<>();

}
