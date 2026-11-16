package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.dto.*;
import com.shanaka.Jewellery_store.model.Product;
import com.shanaka.Jewellery_store.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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

    @PostMapping("/products")
    public ResponseEntity<List<AllProductResDto>> getAllProducts(@RequestBody AllProductsReqWithFiltersDto allProductsReqWithFilters){
        return new ResponseEntity<>(productService.getAllProducts(allProductsReqWithFilters),HttpStatus.OK);
    }


    @GetMapping("/products/{productId}")
    public ResponseEntity<DetailedProductView> getProductById(@PathVariable Integer productId){
        return new ResponseEntity<>( productService.getProductById(Long.valueOf(productId)),HttpStatus.OK);
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<DetailedProductView> updateProduct(
            @PathVariable Long productId,
            @RequestBody UpdateProductRequest request) {
        DetailedProductView updated = productService.updateProduct(productId, request);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> productDelete(@PathVariable Integer productId){
        productService.deleteProduct(Long.valueOf(productId));
        return new ResponseEntity<>(HttpStatus.OK);
    }

}