package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.dto.DiscountReqDto;
import com.shanaka.Jewellery_store.dto.DiscountResDto;
import com.shanaka.Jewellery_store.model.DiscountCode;
import com.shanaka.Jewellery_store.repo.DiscountRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepo discountRepo;

    @Transactional(readOnly = true)
    public DiscountResDto getDiscount(String dis_code) {
        if (dis_code == null || dis_code.isBlank()) {
            throw new IllegalArgumentException("Discount code must not be empty");
        }

        String normalizedCode = dis_code.trim();

        DiscountCode discount = discountRepo.findByDiscountCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new RuntimeException("Discount code not found: " + normalizedCode));

        boolean isNotExpired = discount.getExpDate() != null
                && LocalDateTime.now().isBefore(discount.getExpDate());

        boolean hasValidPercentage = discount.getPercentage() != null
                && discount.getPercentage().compareTo(BigDecimal.ZERO) > 0;

        return DiscountResDto.builder()
                .percentage(discount.getPercentage())
                .expDate(discount.getExpDate())
                .valid(isNotExpired && hasValidPercentage)
                .build();
    }

    @Transactional
    public DiscountCode addDiscount(DiscountReqDto reqDto) {
        String normalizedCode = reqDto.getDiscountCode() != null
                ? reqDto.getDiscountCode().trim().toUpperCase()
                : "";

        if (normalizedCode.isEmpty()) {
            throw new IllegalArgumentException("Discount code is required");
        }

        if (discountRepo.existsByDiscountCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Discount code already exists: " + normalizedCode);
        }

        validatePercentageAndExpiry(reqDto.getPercentage(), reqDto.getExpDate());

        DiscountCode discountCode = DiscountCode.builder()
                .discountCode(normalizedCode)
                .percentage(reqDto.getPercentage())
                .expDate(reqDto.getExpDate())
                .build();

        return discountRepo.save(discountCode);
    }

    @Transactional
    public DiscountCode updateDiscount(Long id, DiscountReqDto reqDto) {
        DiscountCode existing = discountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found with id: " + id));

        if (reqDto.getDiscountCode() != null && !reqDto.getDiscountCode().isBlank()) {
            String normalizedCode = reqDto.getDiscountCode().trim().toUpperCase();
            if (!normalizedCode.equalsIgnoreCase(existing.getDiscountCode())
                    && discountRepo.existsByDiscountCodeIgnoreCase(normalizedCode)) {
                throw new IllegalArgumentException("Discount code already exists: " + normalizedCode);
            }
            existing.setDiscountCode(normalizedCode);
        }

        validatePercentageAndExpiry(reqDto.getPercentage(), reqDto.getExpDate());

        existing.setPercentage(reqDto.getPercentage());
        existing.setExpDate(reqDto.getExpDate());

        return discountRepo.save(existing);
    }

    @Transactional
    public void deleteDiscount(Long id) {
        if (!discountRepo.existsById(id)) {
            throw new RuntimeException("Discount not found with id: " + id);
        }
        discountRepo.deleteById(id);
    }

    private void validatePercentageAndExpiry(BigDecimal percentage, LocalDateTime expDate) {
        if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0
                || percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage must be greater than 0 and up to 100");
        }

        if (expDate == null) {
            throw new IllegalArgumentException("Expiration date is required");
        }
    }
}