package com.shanaka.Jewellery_store.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProductImageReqDto {
    private String imageUrl;
    @JsonProperty("isPrimary")
    private boolean primary;
}
