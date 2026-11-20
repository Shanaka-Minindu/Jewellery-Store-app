package com.shanaka.Jewellery_store.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResDto {
    private BigDecimal percentage;
    private LocalDateTime expDate;
    private boolean valid;
}
