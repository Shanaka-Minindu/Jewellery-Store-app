package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.dto.DiscountResDto;
import com.shanaka.Jewellery_store.service.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @GetMapping("/api/getdiscount/{code}")
    public ResponseEntity<DiscountResDto> getDiscount(@PathVariable String code){
        return new ResponseEntity<>(discountService.getDiscount(code), HttpStatus.OK);
    }
}
