package com.urlshortener.controller;

import com.urlshortener.dto.request.UrlCreateRequest;
import com.urlshortener.dto.response.UrlResponse;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@Slf4j
public class UrlController {

    private final UrlService urlService;

    /**
     * Creates a shortened URL
     *
     * POST /api/urls
     *
     * @param request URL creation request
     * @return Created URL response (201 CREATED)
     */
    @PostMapping("/api/urls")
    public ResponseEntity<UrlResponse> createShortUrl(@Valid @RequestBody UrlCreateRequest request) {
        UrlResponse response = urlService.createShortUrl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Redirects to original URL
     *
     * GET /{shortCode}
     *
     * @param shortCode Short code
     * @param request HTTP request
     * @return 302 FOUND redirect response
     */
    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode, HttpServletRequest request) {
        String originalUrl = urlService.redirectToOriginalUrl(shortCode, request);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }

    /**
     * Retrieves URL information
     *
     * GET /api/urls/{shortCode}
     *
     * @param shortCode Short code
     * @return URL response (200 OK)
     */
    @GetMapping("/api/urls/{shortCode}")
    public ResponseEntity<UrlResponse> getUrlInfo(@PathVariable String shortCode) {
        UrlResponse response = urlService.getUrlInfo(shortCode);
        return ResponseEntity.ok(response);
    }

    /**
     * Deactivates a URL
     *
     * DELETE /api/urls/{shortCode}
     *
     * @param shortCode Short code
     * @return 204 NO CONTENT
     */
    @DeleteMapping("/api/urls/{shortCode}")
    public ResponseEntity<Void> deactivateUrl(@PathVariable String shortCode) {
        urlService.deactivateUrl(shortCode);
        return ResponseEntity.noContent().build();
    }
}
