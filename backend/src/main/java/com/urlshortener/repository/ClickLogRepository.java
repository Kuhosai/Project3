package com.urlshortener.repository;

import com.urlshortener.entity.ClickLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClickLogRepository extends JpaRepository<ClickLog, Long> {
    // Additional query methods will be added in Unit U-002 (Analytics)
}
