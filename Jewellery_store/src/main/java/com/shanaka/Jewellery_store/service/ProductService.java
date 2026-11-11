package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.dto.ProductReqDto;
import com.shanaka.Jewellery_store.model.Category;
import com.shanaka.Jewellery_store.model.Product;
import com.shanaka.Jewellery_store.model.ProductColor;
import com.shanaka.Jewellery_store.model.ProductImage;
import com.shanaka.Jewellery_store.repo.CategoryRepo;
import com.shanaka.Jewellery_store.repo.ProductRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private S3Service s3Service;

    @Transactional
    public Product createProduct(ProductReqDto dto) {
        // 1. Fetch and validate Category
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + dto.getCategoryId()));
        System.out.println(dto);
        System.out.println(dto.getColors());
        // 2. Build Product entity
        Product product = Product.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .quantity(dto.getQuantity())
                .productFor(dto.getProductFor())
                .sellingPrice(dto.getSellingPrice())
                .size(dto.getSize())
                .isNewArrival(dto.isNewArrival())
                .hidePrice(dto.isHidePrice())
                .discount(dto.getDiscount())
                .salePrice(dto.getSalePrice())
                .category(category)
                .build();

        // 3. Map Color Variants and their Images
        if (dto.getColors() != null) {
            dto.getColors().forEach(colorDto -> {
                ProductColor productColor = ProductColor.builder()
                        .colorName(colorDto.getColorName())
                        .colorCode(colorDto.getColorCode())
                        .build();

                if (colorDto.getImages() != null) {
                    System.out.println(colorDto.getImages());
                    colorDto.getImages().forEach(imgDto -> {
                        System.out.println(imgDto);
                        ProductImage image = ProductImage.builder()
                                .imageUrl(imgDto.getImageUrl())
                                .isPrimary(imgDto.isPrimary())
                                .product(product) // Link globally to product
                                .build();

                        productColor.addImage(image);
                        product.addImage(image); // Maintains global product image collection
                    });
                }

                product.addColor(productColor);
            });
        }

        // 4. Save to PostgreSQL database (Cascade ALL will persist colors and images automatically)
        return productRepo.save(product);
    }

    public String getPresignedUrl(String fileName, String fileType) {
        return s3Service.generatePresignedUploadUrl(fileName, fileType);
    }
}