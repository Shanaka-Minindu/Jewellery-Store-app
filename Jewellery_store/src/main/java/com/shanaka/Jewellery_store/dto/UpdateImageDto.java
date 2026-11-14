package com.shanaka.Jewellery_store.dto;

import lombok.Data;

@Data
public class UpdateImageDto {
    private Long id; // Null if it's a newly uploaded image
    private String imageUrl;
    private boolean isPrimary;
}