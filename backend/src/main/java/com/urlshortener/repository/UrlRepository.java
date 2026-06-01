package com.urlshortener.repository;

import com.urlshortener.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    @Query("SELECT u FROM Url u WHERE u.shortCode = :shortCode")
    Optional<Url> findByShortCode(@Param("shortCode") String shortCode);

    boolean existsByShortCode(String shortCode);
}
