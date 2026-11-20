package com.shanaka.Jewellery_store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingAddressReqDto {
    private String firstName;
    private String lastName;
    private String address;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String phone;
}