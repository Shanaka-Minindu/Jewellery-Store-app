package com.shanaka.Jewellery_store.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_title", columnList = "title")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT", name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender productFor;

    @Column(length = 50)
    private String size;

    @Column(nullable = false, name = "is_new_arrival")
    private boolean isNewArrival;

    @Column(nullable = false, name = "hide_price")
    private boolean hidePrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private Category category;

    // One-to-Many relationship mapping color variants to this product
    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonBackReference
    private List<ProductVariant> variants = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }

    public void removeVariant(ProductVariant variant) {
        variants.remove(variant);
        variant.setProduct(null);
    }
}