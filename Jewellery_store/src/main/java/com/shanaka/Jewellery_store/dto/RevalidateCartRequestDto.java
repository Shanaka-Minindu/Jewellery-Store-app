package com.shanaka.Jewellery_store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevalidateCartRequestDto {
    // Variant IDs from the cart
    private List<Long> variantIds;
}