package com.shanaka.Jewellery_store.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shanaka.Jewellery_store.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductReqDto {
    @NotBlank(message = "Product title is required")
    private String title;

    private String description;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Product gender target is required")
    private Gender productFor;

    @NotNull(message = "Selling price is required")
    private BigDecimal sellingPrice;

    private String size;

    @JsonProperty("isNewArrival")
    private boolean newArrival; // Renamed to avoid Lombok/Jackson prefix conflict

    @JsonProperty("hidePrice")
    private boolean hidePrice;

    private BigDecimal discount;

    private BigDecimal salePrice;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "At least one product color variant is required")
    private List<ProductColorReqDto> colors;
}