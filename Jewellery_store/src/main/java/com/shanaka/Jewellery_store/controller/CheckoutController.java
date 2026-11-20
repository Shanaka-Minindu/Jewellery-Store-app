package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.dto.CheckoutOrderReqDto;
import com.shanaka.Jewellery_store.dto.CheckoutOrderResDto;
import com.shanaka.Jewellery_store.dto.RevalidateCartRequestDto;
import com.shanaka.Jewellery_store.dto.RevalidatedCartItemDto;
import com.shanaka.Jewellery_store.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/revalidate")
    public ResponseEntity<List<RevalidatedCartItemDto>> revalidateCart(
            @RequestBody RevalidateCartRequestDto request
    ) {
        return ResponseEntity.ok(checkoutService.revalidateCartItems(request.getVariantIds()));
    }

    @PostMapping("/orders")
    public ResponseEntity<CheckoutOrderResDto> createOrder(
            @RequestBody CheckoutOrderReqDto request
    ) {
        CheckoutOrderResDto response = checkoutService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}