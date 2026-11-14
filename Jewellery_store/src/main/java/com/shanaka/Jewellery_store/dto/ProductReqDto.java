package com.shanaka.Jewellery_store.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shanaka.Jewellery_store.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductReqDto {
    @NotBlank(message = "Product title is required")
    private String title;

    private String description;

    @NotNull(message = "Product gender target is required")
    private Gender productFor;

    private String size;

    @JsonProperty("isNewArrival")
    private boolean newArrival;

    @JsonProperty("hidePrice")
    private boolean hidePrice;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "At least one product color variant is required")
    private List<ProductColorReqDto> colors;
}