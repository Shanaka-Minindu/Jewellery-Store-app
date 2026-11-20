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
public class CheckoutOrderItemReqDto {
    private Long productId;
    private Long variantId;
    private String variantColor;
    private Integer quantity;
    private BigDecimal unitPrice;
}