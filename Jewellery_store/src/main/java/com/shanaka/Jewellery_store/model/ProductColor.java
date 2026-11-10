package com.shanaka.Jewellery_store.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_colors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String colorName; // e.g., "Yellow Gold", "Rose Gold", "Platinum"

    @Column(length = 50)
    private String colorCode; // Optional hex code for UI swatches, e.g., "#FFD700"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder.Default
    @OneToMany(mappedBy = "productColor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImage> images = new ArrayList<>();

    // Helper methods for color-specific images
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProductColor(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProductColor(null);
    }
}