package com.shanaka.Jewellery_store.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public String generatePresignedUploadUrl(String fileName, String contentType) {
        String uniqueFileName = "products/" + UUID.randomUUID() + "_" + fileName;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueFileName)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        return s3Presigner.presignPutObject(presignRequest).url().toString();
    }

    public String getPublicUrl(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    public void deleteFileFromS3(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isBlank()) return;

            // Strip query parameters if present
            String cleanUrl = imageUrl.split("\\?")[0];

            // Extract the relative file key (e.g., products/xyz.png)
            String rawKey = cleanUrl.substring(cleanUrl.indexOf(".amazonaws.com/") + 15);

            // Decode URL characters (like %20 back to spaces)
            String fileKey = URLDecoder.decode(rawKey, StandardCharsets.UTF_8);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            System.out.println("Successfully deleted S3 file: " + fileKey);
        } catch (Exception e) {
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
    }
}