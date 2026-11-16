package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.dto.*;
import com.shanaka.Jewellery_store.model.*;
import com.shanaka.Jewellery_store.repo.CategoryRepo;
import com.shanaka.Jewellery_store.repo.ColorRepo;
import com.shanaka.Jewellery_store.repo.ProductRepo;
import com.shanaka.Jewellery_store.repo.ReviewRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private ColorRepo colorRepo;

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private S3Service s3Service;

    @Transactional
    public Product createProduct(ProductReqDto dto) {
        // 1. Fetch and validate Category
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        // 2. Build Product entity (Shared attributes)
        Product product = Product.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .productFor(dto.getProductFor())
                .size(dto.getSize())
                .isNewArrival(dto.isNewArrival())
                .hidePrice(dto.isHidePrice())
                .category(category)
                .build();

        // 3. Map Color Variants, their unique metrics, and their images
        if (dto.getColors() != null) {
            for (var variantDto : dto.getColors()) {
                // Fetch existing master color from database by ID
                ProductColor masterColor = colorRepo.findById(variantDto.getColorId())
                        .orElseThrow(() -> new EntityNotFoundException("Color not found with ID: " + variantDto.getColorId()));

                // Build the variant entity containing stock, price, itemCode, and primary flag
                ProductVariant variant = ProductVariant.builder()
                        .color(masterColor)
                        .itemCode(variantDto.getItemCode())
                        .quantity(variantDto.getQuantity())
                        .sellingPrice(variantDto.getSellingPrice())
                        .cost(variantDto.getCost())
                        .discount(variantDto.getDiscount())
                        .salePrice(variantDto.getSalePrice())
                        .isPrimary(variantDto.isPrimary())
                        .product(product)
                        .build();

                // Map variant-specific images
                if (variantDto.getImages() != null) {
                    for (var imgDto : variantDto.getImages()) {
                        ProductImage image = ProductImage.builder()
                                .imageUrl(imgDto.getImageUrl())
                                .isPrimary(imgDto.isPrimary())
                                .productVariant(variant)
                                .build();

                        variant.addImage(image);
                    }
                }

                product.addVariant(variant);
            }
        }

        // 4. Save to PostgreSQL database (Cascade ALL will persist variants and images automatically)
        return productRepo.save(product);
    }
    @Transactional(readOnly = true)
    public String getPresignedUrl(String fileName, String fileType) {
        return s3Service.generatePresignedUploadUrl(fileName, fileType);
    }

    @Transactional(readOnly = true)
    public List<AllProductResDto> getAllProducts(AllProductsReqWithFiltersDto req) {
        int page = (req.getPageNumber() != null && req.getPageNumber() >= 0) ? req.getPageNumber() : 0;
        int size = (req.getProductsPerPage() != null && req.getProductsPerPage() > 0) ? req.getProductsPerPage() : 12;

        Pageable pageable = PageRequest.of(page, size);

        // Build Dynamic Specifications for Filtering
        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Category IDs filter
            if (req.getCategoryIds() != null && !req.getCategoryIds().isEmpty()) {
                predicates.add(root.get("category").get("id").in(req.getCategoryIds()));
            }

            // Color IDs filter (Joining through variants to color table)
            if (req.getColorIds() != null && !req.getColorIds().isEmpty()) {
                predicates.add(root.join("variants").get("color").get("id").in(req.getColorIds()));
            }

            // New Arrival filter
            if (req.isNewArrival()) {
                predicates.add(criteriaBuilder.isTrue(root.get("isNewArrival")));
            }

            // Price Range filters (Applied on variants' selling price)
            if (req.getLeastPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.join("variants").get("sellingPrice"), req.getLeastPrice()));
            }
            if (req.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.join("variants").get("sellingPrice"), req.getMaxPrice()));
            }

            // Sale or Discount Item filter
            if (req.isSaleOrDiscountItem()) {
                Predicate hasDiscount = criteriaBuilder.greaterThan(root.join("variants").get("discount"), BigDecimal.ZERO);
                Predicate hasSalePrice = criteriaBuilder.greaterThan(root.join("variants").get("salePrice"), BigDecimal.ZERO);
                predicates.add(criteriaBuilder.or(hasDiscount, hasSalePrice));
            }

            // Search Keyword filter (against product title)
            if (req.getSearchKeyWord() != null && !req.getSearchKeyWord().trim().isEmpty()) {
                String pattern = "%" + req.getSearchKeyWord().trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern));
            }

            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Fetch paginated and filtered results from DB
        List<Product> products = productRepo.findAll(spec, pageable).getContent();

        // Map Entity list to AllProductResDto list
        return products.stream().map(product -> {
            AllProductImageDto primaryImgDto = null;
            AllProductImageDto secondaryImgDto = null;

            // Find primary variant or fallback to the first variant to pull card images
            ProductVariant displayVariant = product.getVariants().stream()
                    .filter(ProductVariant::isPrimary)
                    .findFirst()
                    .orElse(product.getVariants().isEmpty() ? null : product.getVariants().get(0));

            if (displayVariant != null && displayVariant.getImages() != null && !displayVariant.getImages().isEmpty()) {
                var primaryImage = displayVariant.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .orElse(displayVariant.getImages().get(0));

                primaryImgDto = AllProductImageDto.builder()
                        .id(primaryImage.getId())
                        .imageUrl(primaryImage.getImageUrl())
                        .is_Primary(primaryImage.isPrimary())
                        .build();

                var secondaryImage = displayVariant.getImages().stream()
                        .filter(img -> img.getId() != primaryImage.getId())
                        .findFirst()
                        .orElse(null);

                if (secondaryImage != null) {
                    secondaryImgDto = AllProductImageDto.builder()
                            .id(secondaryImage.getId())
                            .imageUrl(secondaryImage.getImageUrl())
                            .is_Primary(secondaryImage.isPrimary())
                            .build();
                }
            }

            // Map all variants into AllProVariants DTOs
            List<AllProVariants> variantDtos = product.getVariants().stream().map(variant -> {
                ProductColor color = variant.getColor();
                return AllProVariants.builder()
                        .id(variant.getId()) // Variant ID as the ID reference
                        .quantity(variant.getQuantity())
                        .sellingPrice(variant.getSellingPrice())
                        .discount(variant.getDiscount())
                        .salePrice(variant.getSalePrice())
                        .colorName(color != null ? color.getColorName() : null)
                        .colorCode(color != null ? color.getColorCode() : null)
                        .build();
            }).collect(Collectors.toList());

            return AllProductResDto.builder()
                    .id(product.getId())
                    .title(product.getTitle())
                    .newArrival(product.isNewArrival())
                    .hidePrice(product.isHidePrice())
                    .primaryImg(primaryImgDto)
                    .secondaryImg(secondaryImgDto)
                    .allProVariants(variantDtos)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DetailedProductView getProductById(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        List<Review> reviews = reviewRepo.findAllByProductId(productId);

        return DetailedProductView.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .productFor(product.getProductFor())
                .size(product.getSize())
                .isNewArrival(product.isNewArrival())
                .hidePrice(product.isHidePrice())
                .reviews(reviews)
                .category(product.getCategory()) // Now safe because Category's 'products' list is ignored
                .variants(product.getVariants()) // Now safe because Image's 'productVariant' is back-referenced
                .build();
    }
    @Transactional
    public DetailedProductView updateProduct(Long productId, UpdateProductRequest request) {
        // 1. Fetch existing product
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        // 2. Fetch and assign new Category if changed
        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            product.setCategory(category);
        }

        // 3. Update basic details
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setProductFor(request.getProductFor());
        product.setSize(request.getSize());
        product.setNewArrival(request.isNewArrival());
        product.setHidePrice(request.isHidePrice());

        // 4. Collect existing image URLs in DB to check for S3 deletions later
        List<String> oldImageUrls = product.getVariants().stream()
                .flatMap(v -> v.getImages().stream())
                .map(ProductImage::getImageUrl)
                .toList();

        List<String> incomingImageUrls = request.getVariants().stream()
                .flatMap(v -> v.getImages().stream())
                .map(UpdateImageDto::getImageUrl)
                .toList();

        for (String oldUrl : oldImageUrls) {
            if (!incomingImageUrls.contains(oldUrl)) {
                s3Service.deleteFileFromS3(oldUrl);
            }
        }

        // 5. Smart Variant Reconciliation (Prevents unique index duplicate key errors)
        List<Long> incomingVariantIds = request.getVariants().stream()
                .map(UpdateVariantDto::getId)
                .filter(id -> id != null)
                .toList();

        // Remove variants that are missing from the incoming request (Orphan removal handles DB deletion)
        product.getVariants().removeIf(existingVariant -> !incomingVariantIds.contains(existingVariant.getId()));

        // Update existing variants or add new ones
        for (UpdateVariantDto vDto : request.getVariants()) {
            ProductColor color = colorRepo.findById(vDto.getColorId())
                    .orElseThrow(() -> new EntityNotFoundException("Color not found"));

            ProductVariant variant;

            if (vDto.getId() != null) {
                // Find existing variant to update
                variant = product.getVariants().stream()
                        .filter(v -> v.getId().equals(vDto.getId()))
                        .findFirst()
                        .orElseThrow(() -> new EntityNotFoundException("Variant not found with ID: " + vDto.getId()));

                variant.setItemCode(vDto.getItemCode());
                variant.setQuantity(vDto.getQuantity());
                variant.setSellingPrice(vDto.getSellingPrice());
                variant.setCost(vDto.getCost());
                variant.setDiscount(vDto.getDiscount());
                variant.setSalePrice(vDto.getSalePrice());
                variant.setPrimary(vDto.isPrimary());
                variant.setColor(color);
            } else {
                // Create brand new variant
                variant = ProductVariant.builder()
                        .itemCode(vDto.getItemCode())
                        .quantity(vDto.getQuantity())
                        .sellingPrice(vDto.getSellingPrice())
                        .cost(vDto.getCost())
                        .discount(vDto.getDiscount())
                        .salePrice(vDto.getSalePrice())
                        .isPrimary(vDto.isPrimary())
                        .color(color)
                        .product(product)
                        .build();
                product.getVariants().add(variant);
            }

            // Reconcile Images inside the variant
            List<Long> incomingImageIds = vDto.getImages().stream()
                    .map(UpdateImageDto::getId)
                    .filter(id -> id != null)
                    .toList();

            variant.getImages().removeIf(img -> !incomingImageIds.contains(img.getId()));

            for (UpdateImageDto iDto : vDto.getImages()) {
                if (iDto.getId() != null) {
                    // Update existing image
                    ProductImage img = variant.getImages().stream()
                            .filter(i -> i.getId().equals(iDto.getId()))
                            .findFirst()
                            .orElseThrow(() -> new EntityNotFoundException("Image not found"));
                    img.setImageUrl(iDto.getImageUrl());
                    img.setPrimary(iDto.isPrimary());
                } else {
                    // Add new image
                    ProductImage newImg = ProductImage.builder()
                            .imageUrl(iDto.getImageUrl())
                            .isPrimary(iDto.isPrimary())
                            .productVariant(variant)
                            .build();
                    variant.getImages().add(newImg);
                }
            }
        }

        Product updatedProduct = productRepo.save(product);
        return getProductById(updatedProduct.getId());
    }

    @Transactional
    public void deleteProduct(Long id) {
        // 1. Fetch product to access variants and images
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return; // Safe exit if product doesn't exist
        }

        // 2. Collect unique image URLs across all variants to prevent duplicate calls
        Set<String> imageUrls = product.getVariants().stream()
                .filter(v -> v.getImages() != null)
                .flatMap(v -> v.getImages().stream())
                .map(ProductImage::getImageUrl)
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());

        // 3. Delete physical files from AWS S3 bucket
        for (String imageUrl : imageUrls) {
            s3Service.deleteFileFromS3(imageUrl);
        }

        // 4. Delete product from MySQL database
        // (CascadeType.ALL & orphanRemoval will clean up variants and image records automatically)
        productRepo.delete(product);
    }
}