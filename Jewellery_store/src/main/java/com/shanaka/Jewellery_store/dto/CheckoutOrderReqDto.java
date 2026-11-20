package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutOrderReqDto {
    private String email; // Optional contact email if needed
    private String firstName;
    private String lastName;
    private String address;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String phone;

    private boolean saveForNextTime;
    private PaymentType paymentType;
    private String discountCode;

    private boolean useDifferentBillingAddress;
    private BillingAddressReqDto billingAddress;

    private List<CheckoutOrderItemReqDto> items;
}