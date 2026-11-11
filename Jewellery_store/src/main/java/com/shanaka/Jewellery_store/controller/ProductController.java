package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.dto.BasicResDto;
import com.shanaka.Jewellery_store.dto.PresignedUrlResDto;
import com.shanaka.Jewellery_store.dto.ProductReqDto;
import com.shanaka.Jewellery_store.model.Product;
import com.shanaka.Jewellery_store.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/product")
    public ResponseEntity<BasicResDto> addProduct(@Valid @RequestBody ProductReqDto productReqDto) {
        Product savedProduct = productService.createProduct(productReqDto);

        BasicResDto response = BasicResDto.builder()
                .id(savedProduct.getId())
                .message("Product created successfully with all color variants and images!")
                .build();

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/product/presigned-url")
    public ResponseEntity<PresignedUrlResDto> getPresignedUrl(
            @RequestParam String fileName,
            @RequestParam String fileType) {

        String url = productService.getPresignedUrl(fileName, fileType);

        PresignedUrlResDto response = PresignedUrlResDto.builder()
                .uploadUrl(url)
                .build();

        return ResponseEntity.ok(response);
    }
}