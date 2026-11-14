package com.shanaka.Jewellery_store.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;


@Data
public class AllProductsReqWithFiltersDto {
    private List<Long> categoryIds;
    private List<Long> colorIds;
    private boolean newArrival;
    private BigDecimal leastPrice;
    private BigDecimal maxPrice;
    private boolean saleOrDiscountItem;
    private String SearchKeyWord;
    private Integer productsPerPage;
    private Integer pageNumber;
}


