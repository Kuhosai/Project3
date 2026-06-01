package com.urlshortener.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.urlshortener.entity.ClickLog;
import com.urlshortener.entity.Url;
import com.urlshortener.repository.ClickLogRepository;
import eu.bitwalker.useragentutils.UserAgent;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClickTrackingService {

    private final ClickLogRepository clickLogRepository;

    @Value("${geoip.database.path:/app/geoip/GeoLite2-City.mmdb}")
    private String geoipDatabasePath;

    private DatabaseReader geoIpReader;

    @PostConstruct
    public void init() {
        try {
            File database = new File(geoipDatabasePath);
            if (database.exists()) {
                geoIpReader = new DatabaseReader.Builder(database).build();
                log.info("GeoIP database loaded successfully from: {}", geoipDatabasePath);
            } else {
                log.warn("GeoIP database not found at: {}. Country code tracking will be disabled.", geoipDatabasePath);
            }
        } catch (IOException e) {
            log.error("Failed to load GeoIP database: {}", e.getMessage());
        }
    }

    /**
     * Asynchronously tracks a click event
     * Non-blocking - does not affect redirect performance
     *
     * @param url URL entity
     * @param request HTTP request
     */
    @Async
    @Transactional
    public void trackClick(Url url, HttpServletRequest request) {
        try {
            String ipAddress = extractIpAddress(request);
            String userAgentString = request.getHeader("User-Agent");
            String referer = request.getHeader("Referer");

            String countryCode = extractCountryCode(ipAddress);
            UserAgent userAgent = UserAgent.parseUserAgentString(userAgentString);

            String browser = userAgent.getBrowser() != null ? userAgent.getBrowser().getName() : "unknown";
            String os = userAgent.getOperatingSystem() != null ? userAgent.getOperatingSystem().getName() : "unknown";
            String deviceType = determineDeviceType(userAgent);

            ClickLog clickLog = ClickLog.builder()
                    .url(url)
                    .ipAddress(ipAddress)
                    .userAgent(userAgentString)
                    .referer(referer)
                    .countryCode(countryCode)
                    .browser(browser)
                    .os(os)
                    .deviceType(deviceType)
                    .clickedAt(LocalDateTime.now())
                    .build();

            clickLogRepository.save(clickLog);
            log.debug("Click tracked for URL: {} from IP: {}", url.getShortCode(), ipAddress);

        } catch (Exception e) {
            log.error("Failed to track click for URL: {}. Error: {}", url.getShortCode(), e.getMessage());
        }
    }

    /**
     * Extracts IP address from HTTP request
     * Handles X-Forwarded-For header for proxy/load balancer scenarios
     *
     * @param request HTTP request
     * @return IP address
     */
    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Extracts country code from IP address using MaxMind GeoIP2
     *
     * @param ipAddress IP address
     * @return ISO 3166-1 alpha-2 country code (e.g., "KR", "US") or "unknown"
     */
    private String extractCountryCode(String ipAddress) {
        if (geoIpReader == null) {
            return "unknown";
        }

        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CityResponse response = geoIpReader.city(inetAddress);
            String countryCode = response.getCountry().getIsoCode();
            return countryCode != null ? countryCode : "unknown";
        } catch (IOException | GeoIp2Exception e) {
            log.debug("Failed to extract country code for IP: {}. Error: {}", ipAddress, e.getMessage());
            return "unknown";
        }
    }

    /**
     * Determines device type from User-Agent
     *
     * @param userAgent Parsed User-Agent
     * @return "mobile", "tablet", "desktop", or "unknown"
     */
    private String determineDeviceType(UserAgent userAgent) {
        if (userAgent.getOperatingSystem() == null) {
            return "unknown";
        }

        String osName = userAgent.getOperatingSystem().getName().toLowerCase();

        if (osName.contains("android") || osName.contains("iphone") || osName.contains("windows phone")) {
            return "mobile";
        } else if (osName.contains("ipad") || osName.contains("tablet")) {
            return "tablet";
        } else if (osName.contains("windows") || osName.contains("mac") || osName.contains("linux")) {
            return "desktop";
        }

        return "unknown";
    }
}
