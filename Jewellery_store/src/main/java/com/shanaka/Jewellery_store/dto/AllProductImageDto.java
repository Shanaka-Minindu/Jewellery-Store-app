package com.shanaka.Jewellery_store.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AllProductImageDto{
    private Long id;
    private String imageUrl;
    private boolean is_Primary;
}
