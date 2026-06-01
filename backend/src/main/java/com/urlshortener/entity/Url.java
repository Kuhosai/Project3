package com.urlshortener.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "urls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Url {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String shortCode;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String originalUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isActive;

    @OneToMany(mappedBy = "url", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClickLog> clickLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    /**
     * URL이 만료되었는지 확인
     * @return 만료되었으면 true, 아니면 false
     */
    public boolean isExpired() {
        if (expiresAt == null) {
            return false; // 영구 URL
        }
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * URL이 접근 가능한 상태인지 확인 (활성 + 만료되지 않음)
     * @return 접근 가능하면 true
     */
    public boolean isAccessible() {
        return Boolean.TRUE.equals(isActive) && !isExpired();
    }

    /**
     * URL을 비활성화 (Soft Delete)
     */
    public void deactivate() {
        this.isActive = false;
    }
}
