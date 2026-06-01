package com.urlshortener.service;

import com.urlshortener.dto.request.UrlCreateRequest;
import com.urlshortener.dto.response.UrlResponse;
import com.urlshortener.entity.Url;
import com.urlshortener.exception.InvalidUrlException;
import com.urlshortener.exception.UrlExpiredException;
import com.urlshortener.exception.UrlInactiveException;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class UrlService {

    private final UrlRepository urlRepository;
    private final Base62EncodingService base62EncodingService;
    private final ClickTrackingService clickTrackingService;

    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?://)([\\w.-]+)(:[0-9]{1,5})?(/.*)?$",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Creates a shortened URL
     *
     * @param request URL creation request
     * @return Created URL response
     */
    @Transactional
    public UrlResponse createShortUrl(UrlCreateRequest request) {
        String originalUrl = normalizeUrl(request.getOriginalUrl());
        validateUrl(originalUrl);
        validateExpirationDate(request.getExpiresAt());

        Url url = Url.builder()
                .originalUrl(originalUrl)
                .createdAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .build();

        // Save to get auto-generated ID
        Url savedUrl = urlRepository.save(url);

        // Generate short code from ID
        String shortCode = base62EncodingService.encode(savedUrl.getId());
        savedUrl.setShortCode(shortCode);

        // Update with short code
        urlRepository.save(savedUrl);

        log.info("Created short URL: {} -> {}", shortCode, originalUrl);
        return UrlResponse.from(savedUrl);
    }

    /**
     * Retrieves original URL by short code and redirects
     * Asynchronously tracks click event
     *
     * @param shortCode Short code
     * @param request HTTP request
     * @return Original URL
     */
    @Transactional(readOnly = true)
    public String redirectToOriginalUrl(String shortCode, HttpServletRequest request) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException("URL not found: " + shortCode));

        if (!url.getIsActive()) {
            throw new UrlInactiveException("URL is inactive: " + shortCode);
        }

        if (url.isExpired()) {
            throw new UrlExpiredException("URL has expired: " + shortCode);
        }

        // Asynchronously track click (non-blocking)
        clickTrackingService.trackClick(url, request);

        log.debug("Redirecting {} -> {}", shortCode, url.getOriginalUrl());
        return url.getOriginalUrl();
    }

    /**
     * Retrieves URL information by short code
     *
     * @param shortCode Short code
     * @return URL response
     */
    @Transactional(readOnly = true)
    public UrlResponse getUrlInfo(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException("URL not found: " + shortCode));

        return UrlResponse.from(url);
    }

    /**
     * Deactivates a URL by short code
     *
     * @param shortCode Short code
     */
    @Transactional
    public void deactivateUrl(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException("URL not found: " + shortCode));

        url.deactivate();
        urlRepository.save(url);

        log.info("Deactivated URL: {}", shortCode);
    }

    /**
     * Normalizes URL by adding http:// if protocol is missing
     *
     * @param url Original URL
     * @return Normalized URL
     */
    private String normalizeUrl(String url) {
        if (url == null || url.isEmpty()) {
            throw new InvalidUrlException("URL cannot be null or empty");
        }

        String trimmedUrl = url.trim();

        if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
            return "http://" + trimmedUrl;
        }

        return trimmedUrl;
    }

    /**
     * Validates URL format
     *
     * @param url URL to validate
     */
    private void validateUrl(String url) {
        if (!URL_PATTERN.matcher(url).matches()) {
            throw new InvalidUrlException("Invalid URL format: " + url);
        }
    }

    /**
     * Validates expiration date
     *
     * @param expiresAt Expiration date
     */
    private void validateExpirationDate(LocalDateTime expiresAt) {
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            throw new InvalidUrlException("Expiration date must be in the future");
        }
    }
}
