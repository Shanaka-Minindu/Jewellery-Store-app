package com.shanaka.Jewellery_store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevalidatedCartItemDto {
    private Long variantId;
    private Long productId;
    private String productTitle;
    private String colorName;
    private String colorCode;
    private String imageUrl;
    private BigDecimal sellingPrice;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer availableQuantity;
    private boolean available;
    private boolean hidePrice;
}