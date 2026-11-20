package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.dto.*;
import com.shanaka.Jewellery_store.model.*;
import com.shanaka.Jewellery_store.repo.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private static final BigDecimal SINGLE_ITEM_SHIPPING_FEE = BigDecimal.valueOf(299);

    private final ProductVariantRepo productVariantRepo;
    private final UserRepo userRepo;
    private final DeliveryInfoRepo deliveryInfoRepo;
    private final OtherBillAddressRepo otherBillAddressRepo;
    private final DiscountRepo discountRepo;
    private final OrderRepo orderRepo;

    @Transactional(readOnly = true)
    public List<RevalidatedCartItemDto> revalidateCartItems(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return List.of();
        }

        List<ProductVariant> variants = productVariantRepo.findAllById(variantIds);
        Map<Long, ProductVariant> variantMap = variants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));

        List<RevalidatedCartItemDto> result = new ArrayList<>();
        for (Long variantId : variantIds) {
            ProductVariant variant = variantMap.get(variantId);
            if (variant == null) {
                continue;
            }

            Product product = variant.getProduct();
            BigDecimal effectivePrice = (variant.getSalePrice() != null
                    && variant.getSalePrice().compareTo(BigDecimal.ZERO) > 0)
                    ? variant.getSalePrice()
                    : variant.getSellingPrice();

            String primaryImgUrl = variant.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElseGet(() -> variant.getImages().isEmpty()
                            ? null
                            : variant.getImages().get(0).getImageUrl());

            int stock = variant.getQuantity() != null ? variant.getQuantity() : 0;

            result.add(RevalidatedCartItemDto.builder()
                    .variantId(variant.getId())
                    .productId(product.getId())
                    .productTitle(product.getTitle())
                    .colorName(variant.getColor() != null ? variant.getColor().getColorName() : null)
                    .colorCode(variant.getColor() != null ? variant.getColor().getColorCode() : null)
                    .imageUrl(primaryImgUrl)
                    .sellingPrice(variant.getSellingPrice())
                    .salePrice(variant.getSalePrice())
                    .effectivePrice(effectivePrice)
                    .availableQuantity(stock)
                    .available(stock > 0)
                    .hidePrice(product.isHidePrice())
                    .build());
        }

        return result;
    }

    @Transactional
    public CheckoutOrderResDto placeOrder(CheckoutOrderReqDto req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart items cannot be empty");
        }

      //  User currentUser = getAuthenticatedUserOrNull();
        User currentUser = null;

        // Requirement 2: Save to delivery_info only if checked AND user is logged in
        if (req.isSaveForNextTime()) {
            if (currentUser == null) {
                throw new IllegalStateException("Please sign in to save delivery information for next time");
            }
            DeliveryInfo deliveryInfo = DeliveryInfo.builder()
                    .user(currentUser)
                    .firstName(req.getFirstName().trim())
                    .lastName(req.getLastName().trim())
                    .address(req.getAddress().trim())
                    .addressLine2(blankToNull(req.getAddressLine2()))
                    .city(req.getCity().trim())
                    .postalCode(blankToNull(req.getPostalCode()))
                    .phone(req.getPhone().trim())
                    .build();
            deliveryInfoRepo.save(deliveryInfo);
        }

        // Requirement 5: Save separate billing address if requested
        OtherBillAddress savedBillingAddress = null;
        if (req.isUseDifferentBillingAddress() && req.getBillingAddress() != null) {
            BillingAddressReqDto b = req.getBillingAddress();
            savedBillingAddress = otherBillAddressRepo.save(OtherBillAddress.builder()
                    .firstName(b.getFirstName().trim())
                    .lastName(b.getLastName().trim())
                    .address(b.getAddress().trim())
                    .addressLine2(blankToNull(b.getAddressLine2()))
                    .city(b.getCity().trim())
                    .postalCode(blankToNull(b.getPostalCode()))
                    .phone(b.getPhone().trim())
                    .build());
        }

        // Build order items using current DB variant prices & calculate total item count
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemQuantity = 0;

        Order order = Order.builder()
                .user(currentUser)
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .address(req.getAddress().trim())
                .addressLine2(blankToNull(req.getAddressLine2()))
                .city(req.getCity().trim())
                .postalCode(blankToNull(req.getPostalCode()))
                .phone(req.getPhone().trim())
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentType(req.getPaymentType() != null ? req.getPaymentType() : PaymentType.ONLINE_GATEWAY)
                .otherBillAddress(savedBillingAddress)
                .build();

        for (CheckoutOrderItemReqDto itemReq : req.getItems()) {
            ProductVariant variant = productVariantRepo.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new EntityNotFoundException("Product variant not found: " + itemReq.getVariantId()));

            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            if (variant.getQuantity() < qty) {
                throw new IllegalStateException("Insufficient stock for " + variant.getProduct().getTitle());
            }

            BigDecimal unitPrice = (variant.getSalePrice() != null
                    && variant.getSalePrice().compareTo(BigDecimal.ZERO) > 0)
                    ? variant.getSalePrice()
                    : variant.getSellingPrice();

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(lineTotal);
            totalItemQuantity += qty;

            OrderItem orderItem = OrderItem.builder()
                    .product(variant.getProduct())
                    .variantColor(itemReq.getVariantColor() != null
                            ? itemReq.getVariantColor()
                            : (variant.getColor() != null ? variant.getColor().getColorName() : "Default"))
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .build();

            order.addOrderItem(orderItem);
        }

        // Apply discount if valid and non-expired
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (req.getDiscountCode() != null && !req.getDiscountCode().isBlank()) {
            DiscountCode discount = discountRepo.findByDiscountCodeIgnoreCase(req.getDiscountCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid discount code"));

            if (discount.getExpDate() == null || !LocalDateTime.now().isBefore(discount.getExpDate())) {
                throw new IllegalArgumentException("Discount code has expired");
            }

            discountAmount = subtotal
                    .multiply(discount.getPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        // Requirement 4: Rs 299 for 1 item; FREE (Rs 0) for more than 1 item
        BigDecimal deliveryFee = totalItemQuantity == 1 ? SINGLE_ITEM_SHIPPING_FEE : BigDecimal.ZERO;
        BigDecimal discountedSubtotal = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);
        BigDecimal finalTotal = discountedSubtotal.add(deliveryFee);

        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(finalTotal);

        Order savedOrder = orderRepo.save(order);

        return CheckoutOrderResDto.builder()
                .orderId(savedOrder.getId())
                .orderStatus(savedOrder.getOrderStatus())
                .paymentStatus(savedOrder.getPaymentStatus())
                .paymentType(savedOrder.getPaymentType())
                .deliveryFee(savedOrder.getDeliveryFee())
                .discountAmount(discountAmount)
                .totalAmount(savedOrder.getTotalAmount())
                .message("Order created with PENDING status")
                .build();
    }

//    private User getAuthenticatedUserOrNull() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
//            return null;
//        }
//        String email = auth.getName();
//        return userRepo.findByEmail(email).orElse(null);
//    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}