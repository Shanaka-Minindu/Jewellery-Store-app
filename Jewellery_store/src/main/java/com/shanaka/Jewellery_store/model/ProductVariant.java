package com.shanaka.Jewellery_store.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_variants", indexes = {
        @Index(name = "idx_variant_item_code", columnList = "itemCode")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 25, nullable = false, unique = true)
    private String itemCode;

    @Column(nullable = false)
    private Integer quantity; // Stock quantity for this specific color variant

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(precision = 5, scale = 2)
    private BigDecimal discount;

    @Column(precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, name = "is_primary")
    private boolean isPrimary; // Marks the default/primary variant to show first on the frontend

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    private ProductColor color; // References master ProductColor

    @Builder.Default
    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImage> images = new ArrayList<>();

    // Helper methods
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProductVariant(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProductVariant(null);
    }
}