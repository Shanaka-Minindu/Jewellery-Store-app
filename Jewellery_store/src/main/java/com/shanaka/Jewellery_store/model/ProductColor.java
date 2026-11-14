package com.shanaka.Jewellery_store.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "product_colors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"colorName"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    @NotNull(message = "Color name is required")
    private String colorName; // e.g., "Red", "Black", "Yellow Gold"

    @Column(length = 50)
    @NotNull(message = "Color code is required")
    private String colorCode; // e.g., "#ff0000", "#000000"
}