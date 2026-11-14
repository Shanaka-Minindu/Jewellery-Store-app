package com.shanaka.Jewellery_store.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductColorReqDto {
    @NotNull(message = "Color ID is required")
    private Long colorId;

    @NotBlank(message = "Item Code is required")
    private String itemCode;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Selling price is required")
    private BigDecimal sellingPrice;

    private BigDecimal cost;
    private BigDecimal discount;
    private BigDecimal salePrice;

    @JsonProperty("isPrimary")
    private boolean primary; // Marks if this variant is the primary display variant for the product

    private List<ProductImageReqDto> images;
}