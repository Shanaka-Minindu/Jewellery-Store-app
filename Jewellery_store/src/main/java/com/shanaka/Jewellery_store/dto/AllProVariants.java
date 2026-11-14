package com.shanaka.Jewellery_store.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AllProVariants{
    private Long id;
    private Integer quantity;
    private BigDecimal sellingPrice;
    private BigDecimal discount;
    private BigDecimal salePrice;
    private String colorName;
    private String colorCode;
}
