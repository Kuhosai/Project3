package com.urlshortener.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "click_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClickLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;

    @Column(length = 45)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String referer;

    @Column(length = 2)
    private String countryCode;

    @Column(length = 50)
    private String browser;

    @Column(length = 50)
    private String os;

    @Column(length = 20)
    private String deviceType;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    @PrePersist
    protected void onCreate() {
        if (clickedAt == null) {
            clickedAt = LocalDateTime.now();
        }
    }

    /**
     * 모바일 디바이스인지 확인
     * @return 모바일이면 true
     */
    public boolean isMobile() {
        return "mobile".equalsIgnoreCase(deviceType);
    }

    /**
     * 국가 코드가 한국인지 확인
     * @return 한국이면 true
     */
    public boolean isFromKorea() {
        return "KR".equalsIgnoreCase(countryCode);
    }
}
