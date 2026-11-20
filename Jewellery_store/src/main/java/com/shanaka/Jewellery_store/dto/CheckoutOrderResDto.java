package com.shanaka.Jewellery_store.dto;

import com.shanaka.Jewellery_store.model.OrderStatus;
import com.shanaka.Jewellery_store.model.PaymentStatus;
import com.shanaka.Jewellery_store.model.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutOrderResDto {
    private Long orderId;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private PaymentType paymentType;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String message;
}