package com.shanaka.Jewellery_store.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductColorReqDto {
    private String colorName;
    private String colorCode;
    private List<ProductImageReqDto> images;
}
