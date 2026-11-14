package com.shanaka.Jewellery_store.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateVariantDto {
    private Long id; // Null if it's a newly added variant
    private String itemCode;
    private Integer quantity;
    private BigDecimal sellingPrice;
    private BigDecimal cost;
    private BigDecimal discount;
    private BigDecimal salePrice;
    private boolean isPrimary;
    private Long colorId;
    private List<UpdateImageDto> images;
}