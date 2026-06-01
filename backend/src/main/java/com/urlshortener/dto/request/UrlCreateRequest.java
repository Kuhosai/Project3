package com.urlshortener.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UrlCreateRequest {

    @NotBlank(message = "Original URL is required")
    @Size(max = 2048, message = "URL too long. Maximum 2048 characters allowed")
    private String originalUrl;

    @Future(message = "Expiration date must be in the future")
    private LocalDateTime expiresAt;
}
