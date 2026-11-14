package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.ProductColor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AllProductResDto {
    private Long id;
    private String title;
    private boolean newArrival;
    private boolean hidePrice;
    private AllProductImageDto primaryImg;
    private AllProductImageDto secondaryImg;
    private List<AllProVariants> allProVariants;

}

