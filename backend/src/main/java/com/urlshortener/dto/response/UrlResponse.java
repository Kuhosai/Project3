package com.urlshortener.dto.response;

import com.urlshortener.entity.Url;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {

    private String shortCode;
    private String originalUrl;
    private String shortUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;

    public static UrlResponse from(Url url) {
        return UrlResponse.builder()
            .shortCode(url.getShortCode())
            .originalUrl(url.getOriginalUrl())
            .shortUrl("http://localhost:8080/" + url.getShortCode())
            .createdAt(url.getCreatedAt())
            .expiresAt(url.getExpiresAt())
            .isActive(url.getIsActive())
            .build();
    }
}
