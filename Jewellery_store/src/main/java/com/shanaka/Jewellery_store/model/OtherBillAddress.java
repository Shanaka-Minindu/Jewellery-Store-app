package com.shanaka.Jewellery_store.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "other_bill_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtherBillAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "address_line2", nullable = true, columnDefinition = "TEXT")
    private String addressLine2;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "postal_code", nullable = true, length = 20)
    private String postalCode;

    @Column(name = "phone", nullable = false, length = 25)
    private String phone;
}