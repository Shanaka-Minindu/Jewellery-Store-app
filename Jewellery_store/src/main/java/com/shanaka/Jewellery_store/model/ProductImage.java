package com.shanaka.Jewellery_store.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false, name = "is_primary")
    private boolean isPrimary; // True = primary image for this variant's card/gallery

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    @JsonBackReference
    private ProductVariant productVariant; // Links image directly to a specific product variant option
}