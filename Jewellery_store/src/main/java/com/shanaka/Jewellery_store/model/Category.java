package com.shanaka.Jewellery_store.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_category_name_gender", columnNames = {"name", "target_gender"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // e.g., "Rings", "Necklaces", "Bracelets"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, name = "target_gender")
    private Gender targetGender; // Specifies whether this category belongs to MALE, FEMALE, or UNISEX



    @Builder.Default
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products = new ArrayList<>();
}