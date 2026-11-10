package com.shanaka.Jewellery_store.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BasicResDto {
    private Long id;
    private String message;
}
