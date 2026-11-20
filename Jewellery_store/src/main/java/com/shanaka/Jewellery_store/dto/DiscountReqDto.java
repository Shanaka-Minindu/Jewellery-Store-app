package com.shanaka.Jewellery_store.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DiscountReqDto {
    private String discountCode;
    private BigDecimal percentage;
    private LocalDateTime expDate;
}